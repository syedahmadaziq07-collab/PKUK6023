/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sounds } from '../../game/audio';
import { speech } from '../../game/speech';
import {
  Compass,
  Hand,
  Volume2,
  X,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartPlaying?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose, onStartPlaying }) => {
  const readTutorial = () => {
    sounds.playClick();
    speech.speak(
      'Selamat datang ke Kedai Mini Bijak! Gunakan papan kekunci atau kawalan sentuh untuk berjalan di dalam supermarket. Dekati barang atau wang, tekan butang E untuk berinteraksi. Kemudian bawa barang ke kaunter untuk membayar bersama juruwang!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-yellow-200" />
            <h3 className="font-black text-xl md:text-2xl">Cara Bermain Kedai Mini Bijak</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/20 active:scale-95 text-white"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Audio narration button */}
          <div className="flex justify-end">
            <button
              onClick={readTutorial}
              className="flex items-center gap-2 text-xs md:text-sm font-bold bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl hover:bg-emerald-200 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Dengar Penerangan Suara</span>
            </button>
          </div>

          {/* 3 Shopping Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-base md:text-lg border-b border-slate-200 pb-1">
              3 Langkah Mudah Membeli-Belah:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center font-black text-lg">
                  1
                </div>
                <div className="font-bold text-slate-800 text-sm">Kenali Wang</div>
                <p className="text-xs text-slate-600">
                  Pergi ke Stesen Wang. Kenali wang RM1 (biru), RM5 (hijau), dan RM10 (merah).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white mx-auto flex items-center justify-center font-black text-lg">
                  2
                </div>
                <div className="font-bold text-slate-800 text-sm">Pilih Barang</div>
                <p className="text-xs text-slate-600">
                  Terokai rak roti, minuman, buah & alat tulis. Semak harga dan masukkan ke bakul.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white mx-auto flex items-center justify-center font-black text-lg">
                  3
                </div>
                <div className="font-bold text-slate-800 text-sm">Bayar di Kaunter</div>
                <p className="text-xs text-slate-600">
                  Bawa bakul ke juruwang. Pilih jumlah wang yang tepat dari dompet dan tekan BAYAR!
                </p>
              </div>
            </div>
          </div>

          {/* Controls Overview */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Kawalan Permainan:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">💻 Komputer / Laptop:</span>
                <ul className="space-y-1 text-slate-600">
                  <li>• <strong>W / A / S / D</strong> atau <strong>Anak Panah</strong>: Bergerak</li>
                  <li>• <strong>Gerakkan Tetikus</strong>: Pandang sekeliling</li>
                  <li>• <strong>E / Enter / Ruang</strong>: Interaksi / Ambil</li>
                  <li>• <strong>ESC</strong>: Lepaskan kunci tetikus</li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">📱 Telefon & Tablet:</span>
                <ul className="space-y-1 text-slate-600">
                  <li>• <strong>Kayu Riang Maya (Kiri)</strong>: Bergerak</li>
                  <li>• <strong>Seret Skrin (Kanan)</strong>: Pandang sekeliling</li>
                  <li>• <strong>Butang Besar "AMBIL"</strong>: Interaksi</li>
                  <li>• <strong>Bawa Saya Ke...</strong>: Panduan stesen pantas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              if (onStartPlaying) onStartPlaying();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-sm md:text-base shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Faham, Jom Mula!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
