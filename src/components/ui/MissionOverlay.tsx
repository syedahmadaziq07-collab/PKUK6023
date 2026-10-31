/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CurrencyDenomination,
  Product,
  CashierScenario,
  PlayerStats,
  MissionProgress,
} from '../../types/game';
import {
  MALAYSIAN_BANKNOTES,
  calculateTotalSen,
  formatNotesFormula,
  validatePayment,
  senToRinggitString,
  getOptimalNotes,
} from '../../game/currency';
import { MISSION_1_QUESTIONS, CASHIER_SCENARIOS, CurrencyQuizQuestion } from '../../game/missions';
import { sounds } from '../../game/audio';
import { speech } from '../../game/speech';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  Receipt,
  X,
  Star,
} from 'lucide-react';

interface MissionOverlayProps {
  missionType: 'mission_1' | 'mission_2' | 'mission_3';
  activeBanknoteValue?: CurrencyDenomination;
  activeProduct?: Product;
  basket: Product[];
  onAddToBasket: (prod: Product) => void;
  onClose: () => void;
  onMissionComplete: (missionId: string, stars: number) => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  missions: MissionProgress[];
}

export const MissionOverlay: React.FC<MissionOverlayProps> = ({
  missionType,
  activeBanknoteValue = 1,
  activeProduct,
  basket,
  onAddToBasket,
  onClose,
  onMissionComplete,
  stats,
  onUpdateStats,
}) => {
  // Mission 1 State
  const [m1QuestionIndex, setM1QuestionIndex] = useState<number>(0);
  const [m1Feedback, setM1Feedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [m1ShowHint, setM1ShowHint] = useState<boolean>(false);
  const [m1Stars, setM1Stars] = useState<number>(0);
  const [m1Finished, setM1Finished] = useState<boolean>(false);
  const currentM1Q: CurrencyQuizQuestion = MISSION_1_QUESTIONS[m1QuestionIndex];

  // Mission 2 State (Product inspection & selection)
  const [m2SelectedDenom, setM2SelectedDenom] = useState<CurrencyDenomination | null>(null);
  const [m2Feedback, setM2Feedback] = useState<string | null>(null);
  const [m2AddedToBasket, setM2AddedToBasket] = useState<boolean>(false);

  // Mission 3 State (Cashier checkout)
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const currentScenario: CashierScenario = CASHIER_SCENARIOS[scenarioIndex];
  const [selectedNotes, setSelectedNotes] = useState<CurrencyDenomination[]>([]);
  const [cashierFeedback, setCashierFeedback] = useState<{
    success: boolean;
    message: string;
    showReceipt?: boolean;
  } | null>(null);
  const [cashierShowHint, setCashierShowHint] = useState<boolean>(false);
  const [scenarioAttempts, setScenarioAttempts] = useState<number>(1);
  const [m3StarsEarned, setM3StarsEarned] = useState<number>(0);
  const [m3Finished, setM3Finished] = useState<boolean>(false);

  // -------------------------------------------------------------
  // MISSION 1 LOGIC: Kenali Wang
  // -------------------------------------------------------------
  const handleM1Answer = (chosen: CurrencyDenomination) => {
    sounds.playClick();
    const isCorrect = chosen === currentM1Q.targetDenomination;

    const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };
    if (isCorrect) {
      if (!m1Feedback) {
        newStats.correctAnswersFirstTry += 1;
      }
      sounds.playSuccessChime();
      setM1Feedback({ isCorrect: true, text: currentM1Q.feedbackCorrect });
      speech.speak(currentM1Q.feedbackCorrect);

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      sounds.playErrorNudge();
      setM1Feedback({ isCorrect: false, text: currentM1Q.feedbackIncorrect });
      speech.speak(currentM1Q.feedbackIncorrect);
    }
    onUpdateStats(newStats);
  };

  const handleM1NextQuestion = () => {
    sounds.playClick();
    setM1Feedback(null);
    setM1ShowHint(false);

    if (m1QuestionIndex + 1 < MISSION_1_QUESTIONS.length) {
      setM1QuestionIndex(m1QuestionIndex + 1);
      const nextQ = MISSION_1_QUESTIONS[m1QuestionIndex + 1];
      speech.speak(nextQ.questionText);
    } else {
      // Completed Mission 1!
      const earnedStars = 3;
      setM1Stars(earnedStars);
      setM1Finished(true);
      sounds.playRegisterChime();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      onMissionComplete('mission_1', earnedStars);
    }
  };

  // -------------------------------------------------------------
  // MISSION 2 LOGIC: Jom Pilih Barang
  // -------------------------------------------------------------
  const handleM2ConfirmItem = () => {
    if (!activeProduct) return;
    sounds.playClick();

    // Check if player selected the right matching note/notes
    const requiredNote = getOptimalNotes(activeProduct.priceSen)[0];
    if (m2SelectedDenom && m2SelectedDenom === requiredNote) {
      sounds.playSuccessChime();
      onAddToBasket(activeProduct);
      setM2AddedToBasket(true);
      setM2Feedback(`Hebat! ${activeProduct.name} telah dimasukkan ke dalam bakul belanja.`);
      speech.speak(`Bagus! ${activeProduct.name} telah dimasukkan ke dalam bakul belanja.`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

      // Update stats
      const newStats = {
        ...stats,
        totalAttempts: stats.totalAttempts + 1,
        correctAnswersFirstTry: stats.correctAnswersFirstTry + 1,
      };
      onUpdateStats(newStats);

      // Check if player has collected at least 2 items, award Mission 2
      if (basket.length >= 1) {
        onMissionComplete('mission_2', 3);
      }
    } else {
      sounds.playErrorNudge();
      setM2Feedback(`Cuba lagi. Harga barang ialah ${activeProduct.priceDisplay}. Pilih wang yang sepadan.`);
      speech.speak(`Cuba lagi. Harga barang ialah ${activeProduct.priceDisplay}.`);
    }
  };

  // -------------------------------------------------------------
  // MISSION 3 LOGIC: Bayar di Kaunter
  // -------------------------------------------------------------
  const handleAddNoteToTray = (val: CurrencyDenomination) => {
    sounds.playClick();
    setSelectedNotes([...selectedNotes, val]);
  };

  const handleRemoveLastNote = () => {
    sounds.playClick();
    setSelectedNotes(selectedNotes.slice(0, -1));
  };

  const handleClearNotes = () => {
    sounds.playClick();
    setSelectedNotes([]);
  };

  const handleCashierPay = () => {
    sounds.playClick();
    const result = validatePayment(selectedNotes, currentScenario.targetTotalSen, true);

    const newStats = {
      ...stats,
      totalAttempts: stats.totalAttempts + 1,
    };

    if (result.valid) {
      sounds.playRegisterChime();
      confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });

      if (scenarioAttempts === 1) {
        newStats.correctAnswersFirstTry += 1;
      }
      newStats.totalPurchases += 1;
      newStats.purchaseHistory.push({
        itemName: currentScenario.items.map((i) => i.name).join(', '),
        priceSen: currentScenario.targetTotalSen,
        paidSen: calculateTotalSen(selectedNotes),
        timestamp: new Date().toLocaleTimeString('ms-MY'),
        attempts: scenarioAttempts,
      });
      onUpdateStats(newStats);

      setCashierFeedback({
        success: true,
        message: 'Tahniah! Bayaran kamu tepat dan betul!',
        showReceipt: true,
      });
      speech.speak('Tahniah! Bayaran kamu tepat dan betul. Terima kasih daun keladi!');
    } else {
      sounds.playErrorNudge();
      setScenarioAttempts(scenarioAttempts + 1);
      onUpdateStats(newStats);
      setCashierFeedback({
        success: false,
        message: result.message,
      });
      speech.speak(result.message);
    }
  };

  const handleNextCashierScenario = () => {
    sounds.playClick();
    setSelectedNotes([]);
    setCashierFeedback(null);
    setCashierShowHint(false);
    setScenarioAttempts(1);

    if (scenarioIndex + 1 < CASHIER_SCENARIOS.length) {
      setScenarioIndex(scenarioIndex + 1);
      speech.speak(CASHIER_SCENARIOS[scenarioIndex + 1].dialogue);
    } else {
      // Completed all 5 cashier scenarios!
      setM3StarsEarned(3);
      setM3Finished(true);
      sounds.playSuccessChime();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      onMissionComplete('mission_3', 3);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/60 backdrop-blur-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="font-bold text-lg md:text-xl">
              {missionType === 'mission_1' && 'Stesen Kenali Wang Malaysia'}
              {missionType === 'mission_2' && 'Pilih Barang di Rak Supermarket'}
              {missionType === 'mission_3' && 'Kaunter Pembayaran Juruwang'}
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-7 overflow-y-auto space-y-6 flex-1">
          {/* ======================================================= */}
          {/* MISSION 1: KENALI WANG */}
          {/* ======================================================= */}
          {missionType === 'mission_1' && (
            <div>
              {!m1Finished ? (
                <div className="space-y-5 text-center">
                  <div className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-500">
                    <span>
                      Soalan {m1QuestionIndex + 1} daripada {MISSION_1_QUESTIONS.length}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        speech.speak(currentM1Q.questionText);
                      }}
                      className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dengar Soalan</span>
                    </button>
                  </div>

                  {/* 3D Banknote Showcase Card */}
                  <div
                    className={`mx-auto w-full max-w-sm rounded-2xl p-5 shadow-lg border-2 text-white transition-all ${
                      currentM1Q.targetDenomination === 1
                        ? 'bg-blue-600 border-blue-400'
                        : currentM1Q.targetDenomination === 5
                        ? 'bg-emerald-600 border-emerald-400'
                        : 'bg-red-600 border-red-400'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      BANK NEGARA MALAYSIA
                    </div>
                    <div className="text-5xl md:text-6xl font-black my-2">
                      RM {currentM1Q.targetDenomination}
                    </div>
                    <div className="text-sm font-semibold opacity-90">
                      {MALAYSIAN_BANKNOTES[currentM1Q.targetDenomination].name}
                    </div>
                    <div className="mt-3 text-xs bg-black/20 py-1 px-3 rounded-full inline-block">
                      Motif: {MALAYSIAN_BANKNOTES[currentM1Q.targetDenomination].motif}
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                    {currentM1Q.questionText}
                  </h3>

                  {/* Accessible Answer Buttons */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
                    {currentM1Q.options.map((denom) => {
                      const noteInfo = MALAYSIAN_BANKNOTES[denom];
                      return (
                        <button
                          key={denom}
                          onClick={() => handleM1Answer(denom)}
                          className={`p-4 rounded-2xl border-4 text-white font-black text-xl md:text-2xl shadow-md transition-all active:scale-95 cursor-pointer ${
                            denom === 1
                              ? 'bg-blue-600 hover:bg-blue-500 border-blue-400'
                              : denom === 5
                              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400'
                              : 'bg-red-600 hover:bg-red-500 border-red-400'
                          }`}
                        >
                          <div>RM{denom}</div>
                          <div className="text-xs font-normal opacity-90">{noteInfo.colorName}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {m1Feedback && (
                    <div
                      className={`p-4 rounded-2xl flex items-center justify-between text-left ${
                        m1Feedback.isCorrect
                          ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {m1Feedback.isCorrect ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-7 h-7 text-amber-600 shrink-0" />
                        )}
                        <span className="font-bold text-sm md:text-base">{m1Feedback.text}</span>
                      </div>

                      {m1Feedback.isCorrect && (
                        <button
                          onClick={handleM1NextQuestion}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm shadow flex items-center gap-1.5 shrink-0 ml-2"
                        >
                          <span>Seterusnya</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Hint Button */}
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setM1ShowHint(!m1ShowHint);
                        const newStats = { ...stats, hintsUsedCount: stats.hintsUsedCount + 1 };
                        onUpdateStats(newStats);
                      }}
                      className="text-slate-600 hover:text-slate-900 text-xs md:text-sm font-semibold flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      <span>{m1ShowHint ? 'Sembunyi Petunjuk' : 'Perlukan Petunjuk?'}</span>
                    </button>
                  </div>

                  {m1ShowHint && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs md:text-sm text-amber-900 font-medium">
                      💡 <strong>Petunjuk:</strong> {currentM1Q.hint}
                    </div>
                  )}
                </div>
              ) : (
                /* Mission 1 Complete Celebration */
                <div className="text-center py-6 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                    Tahniah! Misi 1 Selesai!
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base">
                    Kamu telah berjaya mengenali semua wang kertas Malaysia (RM1, RM5 dan RM10)
                    dengan cemerlang!
                  </p>

                  <div className="flex justify-center gap-2 text-amber-400 my-3">
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="w-10 h-10 fill-current" />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onClose();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-base shadow-lg cursor-pointer"
                    >
                      Teruskan Membeli-Belah
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* MISSION 2: JOM PILIH BARANG */}
          {/* ======================================================= */}
          {missionType === 'mission_2' && activeProduct && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {/* Product Badge */}
                <div
                  className="w-28 h-28 rounded-2xl flex flex-col items-center justify-center text-white shadow-md p-3 text-center"
                  style={{ backgroundColor: activeProduct.color }}
                >
                  <ShoppingBag className="w-8 h-8 mb-1" />
                  <span className="font-bold text-xs">{activeProduct.name}</span>
                </div>

                <div className="flex-1 text-center md:text-left space-y-1">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                    {activeProduct.category}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{activeProduct.name}</h3>
                  <p className="text-sm text-slate-600">{activeProduct.description}</p>
                  <div className="text-2xl font-black text-emerald-600 pt-1">
                    Tanda Harga: {activeProduct.priceDisplay}
                  </div>
                </div>
              </div>

              {!m2AddedToBasket ? (
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <h4 className="text-base md:text-lg font-bold text-slate-800">
                      Berapakah nilai wang yang diperlukan untuk membeli {activeProduct.name}?
                    </h4>
                    <button
                      onClick={() =>
                        speech.speak(
                          `Harga ${activeProduct.name} ialah ${activeProduct.priceDisplay}. Berapakah wang yang diperlukan?`
                        )
                      }
                      className="text-emerald-700 p-1.5 rounded-full hover:bg-emerald-50"
                      aria-label="Dengar"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Select Note Option */}
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    {([1, 5, 10] as CurrencyDenomination[]).map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          sounds.playClick();
                          setM2SelectedDenom(val);
                        }}
                        className={`p-3.5 rounded-2xl border-4 font-black text-lg transition-all cursor-pointer ${
                          m2SelectedDenom === val
                            ? 'border-amber-400 bg-amber-50 scale-105 shadow-md'
                            : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <div
                          className={`text-xl font-black ${
                            val === 1
                              ? 'text-blue-600'
                              : val === 5
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          RM{val}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          {MALAYSIAN_BANKNOTES[val].name}
                        </div>
                      </button>
                    ))}
                  </div>

                  {m2Feedback && (
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-900 font-bold text-sm">
                      {m2Feedback}
                    </div>
                  )}

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleM2ConfirmItem}
                      disabled={!m2SelectedDenom}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl text-base shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Masukkan ke dalam Bakul Belanja</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">
                    {activeProduct.name} Sudah di dalam Bakul!
                  </h4>
                  <p className="text-sm text-slate-600">
                    Jumlah barang di dalam bakul kamu sekarang: {basket.length} barang.
                  </p>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-sm shadow cursor-pointer"
                  >
                    Tutup & Teruskan Membeli
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* MISSION 3: BAYAR DI KAUNTER */}
          {/* ======================================================= */}
          {missionType === 'mission_3' && (
            <div>
              {!m3Finished ? (
                <div className="space-y-5">
                  {/* Cashier Greeting & Scenario info */}
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow">
                      Kak Siti
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                          Juruwang Supermarket • {currentScenario.title}
                        </span>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            speech.speak(currentScenario.dialogue);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 p-1"
                          aria-label="Dengar Kata Juruwang"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-800 font-semibold text-sm md:text-base">
                        "{currentScenario.dialogue}"
                      </p>
                    </div>
                  </div>

                  {/* Checkout Items and Price announcement */}
                  <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
                    <div>
                      <div className="text-xs text-slate-400">Barang untuk Dibayar:</div>
                      <div className="text-base font-bold text-white">
                        {currentScenario.items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-amber-300 font-semibold">JUMLAH HARGA:</div>
                      <div className="text-2xl font-black text-amber-400">
                        {senToRinggitString(currentScenario.targetTotalSen)}
                      </div>
                    </div>
                  </div>

                  {/* Virtual Money Wallet */}
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center justify-between">
                      <span>Dompet Wang Anda (Klik untuk Masukkan Wang):</span>
                      <span className="text-emerald-600 font-semibold">Tepat & Mudah</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {([1, 5, 10] as CurrencyDenomination[]).map((denom) => {
                        const note = MALAYSIAN_BANKNOTES[denom];
                        return (
                          <button
                            key={denom}
                            onClick={() => handleAddNoteToTray(denom)}
                            className={`p-3 md:p-4 rounded-2xl border-3 text-white text-center shadow transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
                              denom === 1
                                ? 'bg-blue-600 hover:bg-blue-500 border-blue-400'
                                : denom === 5
                                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400'
                                : 'bg-red-600 hover:bg-red-500 border-red-400'
                            }`}
                          >
                            <span className="text-xl md:text-2xl font-black">RM{denom}</span>
                            <span className="text-[10px] md:text-xs opacity-90">{note.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Tray & Live Calculation Equation */}
                  <div className="bg-slate-100 p-4 rounded-2xl border-2 border-slate-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>Dulang Bayaran Juruwang:</span>
                      {selectedNotes.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleRemoveLastNote}
                            className="text-xs text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm hover:bg-slate-50 cursor-pointer"
                          >
                            Padam Terakhir
                          </button>
                          <button
                            onClick={handleClearNotes}
                            className="text-xs text-red-600 bg-white px-2 py-0.5 rounded shadow-sm hover:bg-red-50 cursor-pointer"
                          >
                            Kosongkan
                          </button>
                        </div>
                      )}
                    </div>

                    {selectedNotes.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-sm font-semibold italic">
                        Dulang bayaran masih kosong. Sila pilih wang di atas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          {selectedNotes.map((noteVal, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-1.5 rounded-xl text-white font-black text-sm shadow ${
                                noteVal === 1
                                  ? 'bg-blue-600'
                                  : noteVal === 5
                                  ? 'bg-emerald-600'
                                  : 'bg-red-600'
                              }`}
                            >
                              RM{noteVal}
                            </div>
                          ))}
                        </div>

                        {/* Live Equation */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">Persamaan Wang:</span>
                          <span className="text-base font-black text-slate-900">
                            {formatNotesFormula(selectedNotes)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {cashierFeedback && (
                    <div
                      className={`p-4 rounded-2xl flex items-center justify-between ${
                        cashierFeedback.success
                          ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400'
                          : 'bg-amber-100 text-amber-950 border-2 border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {cashierFeedback.success ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                        )}
                        <span className="font-bold text-sm md:text-base">
                          {cashierFeedback.message}
                        </span>
                      </div>

                      {cashierFeedback.success && (
                        <button
                          onClick={handleNextCashierScenario}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-sm shadow flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                        >
                          <span>Seterusnya</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setCashierShowHint(!cashierShowHint);
                        const newStats = { ...stats, hintsUsedCount: stats.hintsUsedCount + 1 };
                        onUpdateStats(newStats);
                      }}
                      className="text-slate-600 hover:text-slate-900 text-xs md:text-sm font-semibold flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      <span>{cashierShowHint ? 'Sembunyi Petunjuk' : 'Perlukan Petunjuk?'}</span>
                    </button>

                    <button
                      onClick={handleCashierPay}
                      disabled={selectedNotes.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black px-7 py-3 rounded-2xl text-base shadow-xl active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Receipt className="w-5 h-5" />
                      <span>BAYAR SEKARANG</span>
                    </button>
                  </div>

                  {cashierShowHint && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs md:text-sm text-amber-900 font-medium">
                      💡 <strong>Petunjuk Juruwang:</strong> {currentScenario.hint}
                    </div>
                  )}
                </div>
              ) : (
                /* Mission 3 Complete Celebration */
                <div className="text-center py-6 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                    Tahniah! Juara Pembeli Bijak!
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base">
                    Kamu telah berjaya membayar 5 senario pembelian di kaunter juruwang dengan tepat!
                  </p>

                  <div className="flex justify-center gap-2 text-amber-400 my-3">
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="w-10 h-10 fill-current" />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onClose();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-base shadow-lg cursor-pointer"
                    >
                      Kembali ke Supermarket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
