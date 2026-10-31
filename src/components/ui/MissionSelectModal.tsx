/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MissionProgress } from '../../types/game';
import { sounds } from '../../game/audio';
import { Star, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';

interface MissionSelectModalProps {
  missions: MissionProgress[];
  onSelectMission: (missionId: string) => void;
  onClose: () => void;
}

export const MissionSelectModal: React.FC<MissionSelectModalProps> = ({
  missions,
  onSelectMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-none animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <h3 className="font-black text-xl">Pilih Misi Pembelajaran</h3>
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

        {/* Content List */}
        <div className="p-6 space-y-4">
          {missions.map((mission, index) => (
            <div
              key={mission.id}
              onClick={() => {
                sounds.playClick();
                onSelectMission(mission.id);
              }}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
                    index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">{mission.title}</h4>
                    {mission.completed && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{mission.shortDesc}</p>

                  <div className="flex items-center gap-1 text-amber-400 mt-2">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= mission.stars ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-slate-500 font-semibold ml-1.5">
                      {mission.stars} / 3 Bintang
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center shadow-sm transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
