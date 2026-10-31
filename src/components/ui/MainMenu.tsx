/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sounds } from '../../game/audio';
import {
  Play,
  HelpCircle,
  ListOrdered,
  GraduationCap,
  Settings,
  Sparkles,
  ShoppingBag,
  Star,
} from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenMissionSelect: () => void;
  onOpenTeacherDashboard: () => void;
  onOpenSettings: () => void;
  totalStars: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenMissionSelect,
  onOpenTeacherDashboard,
  onOpenSettings,
  totalStars,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-b from-slate-950/60 via-slate-900/50 to-slate-950/70 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl border-4 border-amber-400 p-6 md:p-8 text-center flex flex-col items-center space-y-6">
        {/* Logo / Mascot Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-white flex items-center justify-center shadow-xl transform -rotate-3 border-4 border-white">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            KEDAI MINI BIJAK
          </h1>
          <p className="text-emerald-700 font-bold text-base md:text-lg">
            “Jom Membeli-Belah dengan Bijak!”
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Pengembaraan 3D Orang Pertama • Wang Malaysia RM1, RM5 & RM10
          </p>
        </div>

        {/* Star Badge */}
        {totalStars > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-black border border-amber-300">
            <Star className="w-4 h-4 fill-current text-amber-500" />
            <span>{totalStars} / 9 Bintang Terkumpul</span>
          </div>
        )}

        {/* Menu Buttons */}
        <div className="w-full space-y-3 pt-2">
          {/* Mula Bermain */}
          <button
            onClick={() => {
              sounds.playClick();
              onStartGame();
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black py-4 px-6 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer border-2 border-emerald-400"
            aria-label="Mula Bermain"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>MULA BERMAIN</span>
          </button>

          {/* Cara Bermain */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black py-3 px-6 rounded-2xl text-base shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 border-amber-300"
          >
            <HelpCircle className="w-5 h-5" />
            <span>CARA BERMAIN</span>
          </button>

          {/* Pilih Misi */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMissionSelect();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-bold py-2.5 px-6 rounded-2xl text-sm shadow border-2 border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <span>PILIH MISI</span>
          </button>

          {/* Ruang Guru & Tetapan */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenTeacherDashboard();
              }}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold py-2.5 px-3 rounded-2xl text-xs shadow-sm border border-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>RUANG GURU</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onOpenSettings();
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-3 rounded-2xl text-xs shadow-sm border border-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>TETAPAN</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-400 font-medium">
          Disesuaikan untuk Murid Berkeperluan Pendidikan Khas (MBPK)
        </div>
      </div>
    </div>
  );
};
