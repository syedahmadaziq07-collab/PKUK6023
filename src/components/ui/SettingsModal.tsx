/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../../types/game';
import { sounds } from '../../game/audio';
import { speech } from '../../game/speech';
import { resetAllData } from '../../game/storage';
import {
  Settings,
  Volume2,
  VolumeX,
  Sliders,
  Eye,
  Trash2,
  X,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onDataReset,
}) => {
  const handleToggleSound = () => {
    sounds.playClick();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    sounds.setEnabled(updated.soundEnabled);
    onUpdateSettings(updated);
  };

  const handleToggleVoice = () => {
    sounds.playClick();
    const updated = { ...settings, voiceEnabled: !settings.voiceEnabled };
    speech.setEnabled(updated.voiceEnabled);
    onUpdateSettings(updated);
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ ...settings, lookSensitivity: val });
  };

  const handleToggleReducedMotion = () => {
    sounds.playClick();
    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const handleResetData = () => {
    if (window.confirm('Adakah anda pasti mahu memadamkan semua rekod dan skor permainan?')) {
      sounds.playClick();
      resetAllData();
      onDataReset();
      alert('Semua data kemajuan dan penilaian telah dikosongkan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-none animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">Tetapan Permainan</h3>
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
        <div className="p-6 space-y-5">
          {/* Sound Audio */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">Kesan Bunyi & Muzik</div>
                <div className="text-xs text-slate-500">Ka-ching, chimes dan langkah kaki</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={handleToggleSound}
              className="w-6 h-6 accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Voice Speech Audio */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">Suara Bacaan Bahasa Melayu</div>
                <div className="text-xs text-slate-500">Membaca soalan dan arahan wang</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceEnabled}
              onChange={handleToggleVoice}
              className="w-6 h-6 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Look Sensitivity */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Kepekaan Pandangan Tetikus / Sentuh</span>
              </div>
              <span className="font-bold text-emerald-600 text-xs">
                {settings.lookSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={settings.lookSensitivity}
              onChange={handleSensitivityChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Perlahan (MBPK)</span>
              <span>Pantas</span>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">Mod Kurang Pergerakan</div>
                <div className="text-xs text-slate-500">Membantu murid mengelakkan pening</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={handleToggleReducedMotion}
              className="w-6 h-6 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Reset Progress Data */}
          <div className="pt-2">
            <button
              onClick={handleResetData}
              className="w-full p-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Set Semula Rekod Kemajuan</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-sm shadow cursor-pointer"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
