import React, { useState } from 'react';
import { ShieldAlert, Shield, AlertTriangle, Swords } from 'lucide-react';
import { Player, TerritoryState } from '../types/risk';
import { TERRITORY_MAP } from '../data/riskMapData';

interface DefenderAlertModalProps {
  territoryId: string;
  attackerPlayer: Player;
  defenderPlayer: Player;
  armies: number;
  onSelectDefenderDice: (diceCount: number) => void;
  onDismiss: () => void;
}

export const DefenderAlertModal: React.FC<DefenderAlertModalProps> = ({
  territoryId,
  attackerPlayer,
  defenderPlayer,
  armies,
  onSelectDefenderDice,
  onDismiss
}) => {
  const territoryDef = TERRITORY_MAP[territoryId];
  const maxDice = Math.min(2, Math.max(1, armies));
  const [selectedDice, setSelectedDice] = useState<number>(maxDice);

  const handleConfirm = () => {
    onSelectDefenderDice(selectedDice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-black text-red-400 uppercase tracking-wider">התראה מבצעית: הגנת שטח!</div>
            <h3 className="text-xl font-black text-white">הטריטוריה שלך מותקפת!</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-sm text-slate-300">
            השחקן <span className="font-bold text-red-400">{attackerPlayer.name}</span> תוקף את הטריטוריה שלך:
          </div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <span 
              className="w-4 h-4 rounded-full border border-white/40"
              style={{ backgroundColor: defenderPlayer.color }}
            />
            <span>{territoryDef?.nameHebrew || territoryId}</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
            <span>כוחות ההגנה שלך בשטח:</span>
            <span className="font-mono font-bold text-blue-400">{armies} חיילים</span>
          </div>
        </div>

        {/* Defender Dice Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            בחר כמה קוביות הגנה ברצונך להטיל (מומלץ {maxDice} לסיכוי מרבי):
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((num) => (
              <button
                key={num}
                type="button"
                disabled={num > maxDice}
                onClick={() => setSelectedDice(num)}
                className={`py-3 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                  selectedDice === num
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg ring-2 ring-blue-400/50'
                    : num > maxDice
                      ? 'opacity-30 cursor-not-allowed bg-slate-950 text-slate-600 border-slate-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {num} {num === 1 ? 'קוביית הגנה אחת' : '2 קוביות הגנה'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
        >
          אשר קוביות והגן על הטריטוריה
        </button>
      </div>
    </div>
  );
};
