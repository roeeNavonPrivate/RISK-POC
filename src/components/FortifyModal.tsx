import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Player, TerritoryState } from '../types/risk';
import { TERRITORY_MAP } from '../data/riskMapData';
import { sound } from '../utils/audio';

interface FortifyModalProps {
  fromTerritoryId: string;
  toTerritoryId: string;
  player: Player;
  territories: Record<string, TerritoryState>;
  onClose: () => void;
  onExecuteFortify: (armiesToMove: number) => void;
}

export const FortifyModal: React.FC<FortifyModalProps> = ({
  fromTerritoryId,
  toTerritoryId,
  player,
  territories,
  onClose,
  onExecuteFortify
}) => {
  const fromDef = TERRITORY_MAP[fromTerritoryId];
  const toDef = TERRITORY_MAP[toTerritoryId];

  const fromArmies = territories[fromTerritoryId]?.armies || 1;
  const toArmies = territories[toTerritoryId]?.armies || 1;

  // Maximum movable armies = fromArmies - 1 (must leave at least 1 army behind)
  const maxMove = Math.max(1, fromArmies - 1);
  const [armiesToMove, setArmiesToMove] = useState(1);

  const handleConfirm = () => {
    sound.playPlaceTroop();
    onExecuteFortify(armiesToMove);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">תנועת ביצור אסטרטגית</h3>
              <p className="text-xs text-slate-400">העברת כוחות בין טריטוריות מחוברות בשליטתך</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Origin & Destination Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-right">
            <div className="text-xs text-slate-400">טריטוריית מקור:</div>
            <div className="text-base font-black text-white">{fromDef?.nameHebrew}</div>
            <div className="text-xs text-slate-400 flex justify-between pt-1 border-t border-slate-800">
              <span>נותרים:</span>
              <span className="font-mono font-bold text-amber-400">{fromArmies - armiesToMove} חיילים</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-right">
            <div className="text-xs text-slate-400">טריטוריית יעד:</div>
            <div className="text-base font-black text-white">{toDef?.nameHebrew}</div>
            <div className="text-xs text-slate-400 flex justify-between pt-1 border-t border-slate-800">
              <span>יהיו בסיום:</span>
              <span className="font-mono font-bold text-emerald-400">{toArmies + armiesToMove} חיילים</span>
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-3 px-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>כמות חיילים להעברה:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{armiesToMove}</span>
          </div>

          <input
            type="range"
            min={1}
            max={maxMove}
            value={armiesToMove}
            onChange={(e) => setArmiesToMove(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>1 חייל</span>
            <span>{maxMove} חיילים (מקסימום)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer"
          >
            בצע תנועת ביצור
          </button>
        </div>
      </div>
    </div>
  );
};
