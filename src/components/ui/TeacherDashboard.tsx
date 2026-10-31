/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats, MissionProgress } from '../../types/game';
import { PRE_TEST_QUESTIONS, POST_TEST_QUESTIONS, AssessmentQuestion } from '../../game/missions';
import { exportTeacherReportCSV } from '../../game/storage';
import { sounds } from '../../game/audio';
import {
  GraduationCap,
  Download,
  BookOpen,
  Award,
  BarChart3,
  CheckCircle,
  XCircle,
  HelpCircle,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface TeacherDashboardProps {
  stats: PlayerStats;
  missions: MissionProgress[];
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

type TabType = 'ringkasan' | 'rekod' | 'teori' | 'penilaian';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  stats,
  missions,
  onUpdateStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');

  // Assessment Quiz State
  const [assessmentType, setAssessmentType] = useState<'pre' | 'post' | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [recordedDetails, setRecordedDetails] = useState<any[]>([]);

  const accuracyRate =
    stats.totalAttempts > 0
      ? ((stats.correctAnswersFirstTry / stats.totalAttempts) * 100).toFixed(1)
      : '0.0';

  const handleExportCSV = () => {
    sounds.playClick();
    exportTeacherReportCSV(stats, missions);
  };

  const startAssessment = (type: 'pre' | 'post') => {
    sounds.playClick();
    setAssessmentType(type);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setRecordedDetails([]);
  };

  const currentQuestions: AssessmentQuestion[] =
    assessmentType === 'pre' ? PRE_TEST_QUESTIONS : POST_TEST_QUESTIONS;
  const currentQ = currentQuestions[currentQuizIndex];

  const handleSelectQuizAnswer = (idx: number) => {
    sounds.playClick();
    setSelectedAnswer(idx);
  };

  const handleNextQuizQuestion = () => {
    if (selectedAnswer === null) return;
    sounds.playClick();

    const isCorrect = selectedAnswer === currentQ.correctIndex;
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    const detailEntry = {
      questionId: currentQ.id,
      question: currentQ.question,
      selectedAnswer: currentQ.options[selectedAnswer],
      correctAnswer: currentQ.options[currentQ.correctIndex],
      isCorrect,
    };
    const updatedDetails = [...recordedDetails, detailEntry];
    setRecordedDetails(updatedDetails);

    if (currentQuizIndex + 1 < currentQuestions.length) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Completed Assessment
      setQuizCompleted(true);
      const nowStr = new Date().toLocaleDateString('ms-MY');
      const newStats = { ...stats };
      if (assessmentType === 'pre') {
        newStats.assessmentScores.preTest = {
          score: newScore,
          total: currentQuestions.length,
          date: nowStr,
          details: updatedDetails,
        };
      } else {
        newStats.assessmentScores.postTest = {
          score: newScore,
          total: currentQuestions.length,
          date: nowStr,
          details: updatedDetails,
        };
      }
      onUpdateStats(newStats);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-4 border-indigo-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="font-black text-lg md:text-xl">Ruang Guru & Penyelaras MBPK</h2>
              <p className="text-xs text-indigo-200">
                Papan Pemuka Diagnostik Pendidikan Khas & Laporan Pembelajaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Eksport CSV</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 text-white"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs md:text-sm font-bold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('ringkasan');
            }}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ringkasan'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ringkasan Prestasi</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('rekod');
            }}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rekod'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rekod Pembelian</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('penilaian');
            }}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'penilaian'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Penilaian MBPK</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('teori');
            }}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'teori'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Teori Pendidikan</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-700 uppercase">
                    Ketepatan Kali Pertama
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-800 mt-1">
                    {accuracyRate}%
                  </div>
                  <div className="text-[11px] text-emerald-600">
                    {stats.correctAnswersFirstTry} daripada {stats.totalAttempts} percubaan
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-700 uppercase">Bintang Terkumpul</div>
                  <div className="text-2xl md:text-3xl font-black text-amber-800 mt-1">
                    {stats.totalStars} / 9
                  </div>
                  <div className="text-[11px] text-amber-600">Pencapaian keseluruhan</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 uppercase">Jumlah Pembelian</div>
                  <div className="text-2xl md:text-3xl font-black text-blue-800 mt-1">
                    {stats.totalPurchases}
                  </div>
                  <div className="text-[11px] text-blue-600">Transaksi kaunter berjaya</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="text-xs font-bold text-purple-700 uppercase">Petunjuk Digunakan</div>
                  <div className="text-2xl md:text-3xl font-black text-purple-800 mt-1">
                    {stats.hintsUsedCount}
                  </div>
                  <div className="text-[11px] text-purple-600">Scaffolding sokongan</div>
                </div>
              </div>

              {/* Mission Progress Overview */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm md:text-base">
                  Status Kemajuan Misi:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {missions.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700">{m.title}</span>
                        {m.completed ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Selesai
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                            Belum
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-amber-500 font-bold">
                        {'★'.repeat(m.stars)}
                        {'☆'.repeat(3 - m.stars)} ({m.stars}/3)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Status Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Status Penilaian Awal (Pre-Test)
                  </span>
                  <div className="text-lg font-black text-slate-800 mt-1">
                    {stats.assessmentScores.preTest ? (
                      <span className="text-emerald-700">
                        {stats.assessmentScores.preTest.score} /{' '}
                        {stats.assessmentScores.preTest.total} ({stats.assessmentScores.preTest.date})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-sm italic">
                        Belum diduduki oleh murid
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Status Penilaian Akhir (Post-Test)
                  </span>
                  <div className="text-lg font-black text-slate-800 mt-1">
                    {stats.assessmentScores.postTest ? (
                      <span className="text-emerald-700">
                        {stats.assessmentScores.postTest.score} /{' '}
                        {stats.assessmentScores.postTest.total} ({stats.assessmentScores.postTest.date})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-sm italic">
                        Belum diduduki oleh murid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REKOD PEMBELIAN */}
          {activeTab === 'rekod' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                Log Transaksi & Pembelian di Kaunter:
              </h3>

              {stats.purchaseHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm italic">
                  Belum ada transaksi direkodkan. Murid boleh melakukan pembelian di Kaunter Juruwang
                  (Misi 3).
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Barang</th>
                        <th className="p-3">Harga</th>
                        <th className="p-3">Bayaran Dibuat</th>
                        <th className="p-3">Bil. Percubaan</th>
                        <th className="p-3">Masa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                      {stats.purchaseHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold">{item.itemName}</td>
                          <td className="p-3 text-emerald-700">RM{item.priceSen / 100}</td>
                          <td className="p-3">RM{item.paidSen / 100}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                item.attempts === 1
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.attempts} percubaan
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-xs">{item.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PENILAIAN MBPK */}
          {activeTab === 'penilaian' && (
            <div className="space-y-6">
              {!assessmentType ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Modul penilaian ini mengandungi soalan berstruktur untuk menguji pemahaman murid
                    sebelum dan selepas intervensi permainan 3D.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pre-Test Box */}
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            A
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Penilaian Awal (Pre-Test)</h4>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          5 soalan pengenalan asas nilai wang RM1, RM5 dan harga sepadan.
                        </p>
                        {stats.assessmentScores.preTest && (
                          <div className="mt-3 p-2 bg-white rounded-lg text-xs text-emerald-700 font-bold">
                            Skor Direkodkan: {stats.assessmentScores.preTest.score} /{' '}
                            {stats.assessmentScores.preTest.total} ({stats.assessmentScores.preTest.date})
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => startAssessment('pre')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer"
                      >
                        {stats.assessmentScores.preTest ? 'Ulang Penilaian Awal' : 'Mula Penilaian Awal'}
                      </button>
                    </div>

                    {/* Post-Test Box */}
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            B
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Penilaian Akhir (Post-Test)</h4>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          5 soalan pengukuhan mengenali warna wang dan membuat bayaran di kaunter.
                        </p>
                        {stats.assessmentScores.postTest && (
                          <div className="mt-3 p-2 bg-white rounded-lg text-xs text-emerald-700 font-bold">
                            Skor Direkodkan: {stats.assessmentScores.postTest.score} /{' '}
                            {stats.assessmentScores.postTest.total} ({stats.assessmentScores.postTest.date})
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => startAssessment('post')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer"
                      >
                        {stats.assessmentScores.postTest ? 'Ulang Penilaian Akhir' : 'Mula Penilaian Akhir'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Assessment Interactive Flow */
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-indigo-700 text-sm">
                      {assessmentType === 'pre' ? 'Penilaian Awal' : 'Penilaian Akhir'} • Soalan{' '}
                      {currentQuizIndex + 1} daripada {currentQuestions.length}
                    </span>
                    <button
                      onClick={() => setAssessmentType(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  {!quizCompleted ? (
                    <div className="space-y-4">
                      <h4 className="text-lg md:text-xl font-bold text-slate-900">
                        {currentQ.question}
                      </h4>

                      <div className="space-y-2">
                        {currentQ.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizAnswer(idx)}
                            className={`w-full p-4 rounded-xl border-2 text-left font-bold text-sm md:text-base transition-all cursor-pointer ${
                              selectedAnswer === idx
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="inline-block w-6 text-slate-400 font-semibold">
                              {['A', 'B', 'C'][idx]}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleNextQuizQuestion}
                          disabled={selectedAnswer === null}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow cursor-pointer"
                        >
                          {currentQuizIndex + 1 === currentQuestions.length
                            ? 'Selesaikan Penilaian'
                            : 'Soalan Seterusnya'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                        <Award className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-800">Penilaian Selesai!</h4>
                      <p className="text-sm text-slate-600">
                        Skor Murid: <strong>{quizScore}</strong> daripada{' '}
                        <strong>{currentQuestions.length}</strong> soalan betul.
                      </p>
                      <button
                        onClick={() => setAssessmentType(null)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow cursor-pointer"
                      >
                        Kembali ke Menu Penilaian
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEORI PENDIDIKAN & PEDAGOGI */}
          {activeTab === 'teori' && (
            <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  1. Teori Perkembangan Kognitif (Cognitive Development - Piaget)
                </h4>
                <p>
                  Murid berkeperluan pendidikan khas (MBPK) memerlukan perwakilan konkrit sebelum
                  memahami konsep nombor abstrak. Persekitaran 3D orang pertama menyediakan objek
                  interaktif 3D (wang kertas dan barangan supermarket) yang membolehkan murid
                  mengaitkan ciri visual wang (warna biru RM1, hijau RM5, merah RM10) secara konkrit.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  2. Teori Pembelajaran Behavioral (Skinner - Operant Conditioning)
                </h4>
                <p>
                  Pengukuhan positif serta-merta (immediate positive reinforcement) melalui bunyi
                  ka-ching, bintang emas, dan pujian juruwang memperkukuh tingkah laku yang betul.
                  Kesilapan ditangani secara sokongan tanpa penalti atau pemotongan markah (zero-stress
                  learning).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  3. Teori Sosioemosional & Keyakinan Diri
                </h4>
                <p>
                  Interaksi santai bersama avatar juruwang melatih kemahiran sosial berbelanja di dunia
                  sebenar. Murid membina autonomi, keyakinan membuat keputusan sendiri, dan tidak berasa
                  takut melakukan kesilapan semasa memilih wang.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            KEDAI MINI BIJAK • Kurikulum Pendidikan Khas Malaysia (KSSR PK)
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold px-5 py-2 rounded-xl text-xs md:text-sm shadow cursor-pointer"
          >
            Tutup Ruang Guru
          </button>
        </div>
      </div>
    </div>
  );
};
