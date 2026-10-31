/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product, MissionProgress, GameSettings } from '../../types/game';
import { sounds } from '../../game/audio';
import { speech } from '../../game/speech';
import {
  Star,
  ShoppingBag,
  Volume2,
  VolumeX,
  HelpCircle,
  Menu,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface GameHUDProps {
  currentMission: MissionProgress;
  totalStars: number;
  basket: Product[];
  onOpenBasket: () => void;
  onOpenHelp: () => void;
  onOpenMenu: () => void;
  onOpenTeacherDashboard: () => void;
  settings: GameSettings;
  onToggleSound: () => void;
  onToggleVoice: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentMission,
  totalStars,
  basket,
  onOpenBasket,
  onOpenHelp,
  onOpenMenu,
  onOpenTeacherDashboard,
  settings,
  onToggleSound,
  onToggleVoice,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-3 md:p-4 pointer-events-none flex items-center justify-between">
      {/* Left: Current Mission Info & Objective Badge */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMenu();
          }}
          className="bg-white/95 hover:bg-white text-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-md border border-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
        </button>

        <div className="bg-white/95 text-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-md border border-emerald-200 flex items-center gap-2 sm:gap-3 max-w-[170px] sm:max-w-none">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
            🎯
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-700 tracking-wider truncate">
              Objektif Semasa
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-800 truncate">
              {currentMission.title}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Stars & Achievements */}
      <div className="hidden sm:flex items-center gap-2 bg-amber-500/95 text-white px-4 py-2 rounded-2xl shadow-md border-2 border-amber-300 pointer-events-auto">
        <Star className="w-5 h-5 fill-current text-white animate-wiggle" />
        <span className="font-black text-sm md:text-base">{totalStars} / 9 Bintang</span>
      </div>

      {/* Right: Actions (Basket, Teacher, Sound, Help) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Shopping Basket Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenBasket();
          }}
          className="relative bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-2xl shadow-md font-bold flex items-center gap-2 text-xs md:text-sm active:scale-95 transition-all cursor-pointer border border-emerald-400"
          aria-label="Buka Bakul Belanja"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="hidden xs:inline">Bakul</span>
          {basket.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center -ml-1">
              {basket.length}
            </span>
          )}
        </button>

        {/* Teacher Space Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTeacherDashboard();
          }}
          className="bg-white/95 hover:bg-white text-indigo-700 p-2.5 rounded-2xl shadow-md border border-indigo-200 active:scale-95 transition-all cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-bold"
          aria-label="Ruang Guru"
        >
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <span>Ruang Guru</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleSound();
          }}
          className="bg-white/95 hover:bg-white text-slate-700 p-2.5 rounded-2xl shadow-md border border-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label={settings.soundEnabled ? 'Matikan Bunyi' : 'Hidupkan Bunyi'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Help Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenHelp();
          }}
          className="bg-white/95 hover:bg-white text-slate-700 p-2.5 rounded-2xl shadow-md border border-slate-200 active:scale-95 transition-all cursor-pointer"
          aria-label="Cara Bermain"
        >
          <HelpCircle className="w-5 h-5 text-amber-500" />
        </button>
      </div>
    </header>
  );
};
