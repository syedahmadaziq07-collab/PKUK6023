/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../../types/game';
import { senToRinggitString } from '../../game/currency';
import { sounds } from '../../game/audio';
import { ShoppingBag, Trash2, ArrowRight, X, Sparkles } from 'lucide-react';

interface BasketModalProps {
  basket: Product[];
  onRemoveItem: (index: number) => void;
  onClearBasket: () => void;
  onGoToCashier: () => void;
  onClose: () => void;
}

export const BasketModal: React.FC<BasketModalProps> = ({
  basket,
  onRemoveItem,
  onClearBasket,
  onGoToCashier,
  onClose,
}) => {
  const totalSen = basket.reduce((sum, item) => sum + item.priceSen, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-none animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-300" />
            <h3 className="font-bold text-lg md:text-xl">Bakul Belanja Anda</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/20 active:scale-95 text-white"
            aria-label="Tutup Bakul"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {basket.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-600 font-medium text-sm">
                Bakul belanja kamu masih kosong!
              </p>
              <p className="text-xs text-slate-400">
                Dekati rak barang di supermarket dan tekan "E" untuk memilih barang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {basket.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.priceDisplay}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600">{item.priceDisplay}</span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRemoveItem(idx);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      aria-label={`Keluarkan ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {basket.length > 0 && (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  onClearBasket();
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Kosongkan Bakul
              </button>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase">Jumlah Perlu Dibayar:</div>
                <div className="text-2xl font-black text-emerald-600">
                  {senToRinggitString(totalSen)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>

          {basket.length > 0 && (
            <button
              onClick={() => {
                sounds.playClick();
                onGoToCashier();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Bayar di Kaunter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
