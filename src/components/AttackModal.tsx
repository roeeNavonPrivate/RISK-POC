import React, { useState } from 'react';
import { Swords, ShieldAlert, Award, ArrowLeft, ArrowRight, Dices, AlertTriangle } from 'lucide-react';
import { Player, TerritoryState } from '../types/risk';
import { TERRITORY_MAP } from '../data/riskMapData';
import { resolveBattle } from '../utils/gameRules';
import { sound } from '../utils/audio';

interface AttackModalProps {
  fromTerritoryId: string;
  toTerritoryId: string;
  attackerPlayer: Player;
  defenderPlayer: Player;
  territories: Record<string, TerritoryState>;
  onClose: () => void;
  onBattleResolved: (results: {
    fromId: string;
    toId: string;
    conquered: boolean;
    armiesMoved?: number;
    attackerArmiesLeft: number;
    defenderArmiesLeft: number;
    attackerLosses: number;
    defenderLosses: number;
  }) => void;
}

export const AttackModal: React.FC<AttackModalProps> = ({
  fromTerritoryId,
  toTerritoryId,
  attackerPlayer,
  defenderPlayer,
  territories,
  onClose,
  onBattleResolved
}) => {
  const fromDef = TERRITORY_MAP[fromTerritoryId];
  const toDef = TERRITORY_MAP[toTerritoryId];

  const [fromArmies, setFromArmies] = useState(territories[fromTerritoryId]?.armies || 1);
  const [toArmies, setToArmies] = useState(territories[toTerritoryId]?.armies || 1);

  // Maximum dice calculation
  const maxAttackerDice = Math.min(3, Math.max(1, fromArmies - 1));
  const maxDefenderDice = Math.min(2, Math.max(1, toArmies));

  const [attackerDiceCount, setAttackerDiceCount] = useState(maxAttackerDice);
  const [defenderDiceCount, setDefenderDiceCount] = useState(maxDefenderDice);

  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<{
    attackerDice: number[];
    defenderDice: number[];
    attackerLosses: number;
    defenderLosses: number;
  } | null>(null);

  // Conquest state
  const [isConquered, setIsConquered] = useState(false);
  const [armiesToMove, setArmiesToMove] = useState(1);
  const [minMoveAllowed, setMinMoveAllowed] = useState(1);

  // Handle Dice Roll
  const handleRoll = () => {
    if (fromArmies <= 1 || toArmies <= 0 || isRolling) return;

    setIsRolling(true);
    sound.playDiceRoll();

    // Roll with animation delay
    setTimeout(() => {
      const outcome = resolveBattle(attackerDiceCount, defenderDiceCount);
      const nextFromArmies = Math.max(1, fromArmies - outcome.attackerLosses);
      const nextToArmies = Math.max(0, toArmies - outcome.defenderLosses);

      setFromArmies(nextFromArmies);
      setToArmies(nextToArmies);
      setLastRoll(outcome);
      setIsRolling(false);

      if (outcome.attackerLosses > 0 || outcome.defenderLosses > 0) {
        sound.playBattleClash();
      }

      if (nextToArmies === 0) {
        // Conquered!
        sound.playConquer();
        setIsConquered(true);
        const minMove = Math.min(attackerDiceCount, nextFromArmies - 1);
        setMinMoveAllowed(minMove);
        setArmiesToMove(minMove);
      } else {
        // Update dice selectors for next roll if still battling
        const newMaxAttacker = Math.min(3, Math.max(1, nextFromArmies - 1));
        const newMaxDefender = Math.min(2, Math.max(1, nextToArmies));
        if (attackerDiceCount > newMaxAttacker) setAttackerDiceCount(newMaxAttacker);
        if (defenderDiceCount > newMaxDefender) setDefenderDiceCount(newMaxDefender);
      }
    }, 700);
  };

  // Confirm conquest troop movement
  const handleConfirmConquest = () => {
    onBattleResolved({
      fromId: fromTerritoryId,
      toId: toTerritoryId,
      conquered: true,
      armiesMoved: armiesToMove,
      attackerArmiesLeft: fromArmies - armiesToMove,
      defenderArmiesLeft: 0,
      attackerLosses: lastRoll?.attackerLosses || 0,
      defenderLosses: lastRoll?.defenderLosses || 0,
    });
  };

  // Close / Stop attacking
  const handleStopAttack = () => {
    onBattleResolved({
      fromId: fromTerritoryId,
      toId: toTerritoryId,
      conquered: false,
      attackerArmiesLeft: fromArmies,
      defenderArmiesLeft: toArmies,
      attackerLosses: lastRoll?.attackerLosses || 0,
      defenderLosses: lastRoll?.defenderLosses || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div 
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: attackerPlayer.color }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: defenderPlayer.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">קרב טריטוריאלי</h3>
              <p className="text-xs text-slate-400">הטלת קוביות מלחמה להכרעת הקרב</p>
            </div>
          </div>
          {!isConquered && (
            <button
              onClick={handleStopAttack}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            >
              עצור התקפה
            </button>
          )}
        </div>

        {/* Territory vs Territory Matchup Card */}
        <div className="grid grid-cols-2 gap-4">
          {/* Attacker */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-red-500/30 space-y-2 text-right">
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: attackerPlayer.color }}
              />
              <span className="text-xs font-bold text-red-400">תוקף: {attackerPlayer.name}</span>
            </div>
            <div className="text-lg font-black text-white">{fromDef?.nameHebrew || fromTerritoryId}</div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">צבא נוכחי:</span>
              <span className="font-mono font-black text-red-400 text-base">{fromArmies} חיילים</span>
            </div>
          </div>

          {/* Defender */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-2 text-right">
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: defenderPlayer.color }}
              />
              <span className="text-xs font-bold text-blue-400">מגן: {defenderPlayer.name}</span>
            </div>
            <div className="text-lg font-black text-white">{toDef?.nameHebrew || toTerritoryId}</div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">צבא נוכחי:</span>
              <span className="font-mono font-black text-blue-400 text-base">{toArmies} חיילים</span>
            </div>
          </div>
        </div>

        {/* If territory conquered, show Troop Advance interface */}
        {isConquered ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span>ניצחון! הטריטוריה נכבשה בהצלחה!</span>
              </div>
              <h4 className="text-xl font-black text-white mt-2">
                כמה צבאות ברצונך להעביר ל{toDef?.nameHebrew}?
              </h4>
              <p className="text-xs text-slate-400">
                לפי חוקי סיכון: מינימום {minMoveAllowed} חיילים (כמספר הקוביות שהוטלו), וחובה להשאיר לפחות חייל 1 מאחור.
              </p>
            </div>

            {/* Slider / Counter */}
            <div className="space-y-3 px-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>חיילים שיועברו:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{armiesToMove}</span>
                <span>יישארו במקור: <span className="text-white font-mono">{fromArmies - armiesToMove}</span></span>
              </div>

              <input
                type="range"
                min={minMoveAllowed}
                max={Math.max(minMoveAllowed, fromArmies - 1)}
                value={armiesToMove}
                onChange={(e) => setArmiesToMove(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>מינימום ({minMoveAllowed})</span>
                <span>מקסימום ({fromArmies - 1})</span>
              </div>
            </div>

            <button
              onClick={handleConfirmConquest}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              אשר העברת צבאות והמשך בתור
            </button>
          </div>
        ) : (
          /* Dice Selection & Battle Arena */
          <div className="space-y-6">
            {/* Dice Selectors */}
            <div className="grid grid-cols-2 gap-4">
              {/* Attacker Dice Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  קוביות תוקף (עד {maxAttackerDice}):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      type="button"
                      disabled={num > maxAttackerDice}
                      onClick={() => setAttackerDiceCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        attackerDiceCount === num
                          ? 'bg-red-600 text-white border-red-400 shadow-md'
                          : num > maxAttackerDice
                            ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'קובייה' : 'קוביות'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defender Dice Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  קוביות מגן (עד {maxDefenderDice}):
                </label>
                <div className="flex gap-2">
                  {[1, 2].map(num => (
                    <button
                      key={num}
                      type="button"
                      disabled={num > maxDefenderDice}
                      onClick={() => setDefenderDiceCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        defenderDiceCount === num
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : num > maxDefenderDice
                            ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'קובייה' : 'קוביות'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Last Roll Results Display */}
            {lastRoll && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 text-center">תוצאות הקרב האחרון:</div>

                <div className="flex items-center justify-around">
                  {/* Attacker Dice Rolled */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-red-400">תוקף ({attackerDiceCount})</span>
                    <div className="flex gap-1.5">
                      {lastRoll.attackerDice.map((val, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-xl bg-red-600 border border-red-400 text-white font-mono font-black text-lg flex items-center justify-center shadow-md animate-bounce"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                    {lastRoll.attackerLosses > 0 ? (
                      <span className="text-[11px] text-red-400 font-bold">איבד {lastRoll.attackerLosses} ✘</span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold">ללא אבדות!</span>
                    )}
                  </div>

                  <div className="text-slate-600 font-black text-xl">VS</div>

                  {/* Defender Dice Rolled */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-blue-400">מגן ({defenderDiceCount})</span>
                    <div className="flex gap-1.5">
                      {lastRoll.defenderDice.map((val, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400 text-white font-mono font-black text-lg flex items-center justify-center shadow-md animate-bounce"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                    {lastRoll.defenderLosses > 0 ? (
                      <span className="text-[11px] text-red-400 font-bold">איבד {lastRoll.defenderLosses} ✘</span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold">ללא אבדות!</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Roll Dice Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStopAttack}
                className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                עצור מתקפה
              </button>

              <button
                type="button"
                disabled={isRolling || fromArmies <= 1}
                onClick={handleRoll}
                className={`flex-1 py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isRolling
                    ? 'bg-slate-800 text-slate-400 cursor-wait'
                    : fromArmies <= 1
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'מגלגל קוביות מלחמה...' : 'הטל קוביות והילחם!'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
