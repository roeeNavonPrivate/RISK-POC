import React from 'react';
import { Trophy, Sparkles, Home, History, Swords, Shield, Award } from 'lucide-react';
import { Player, GameState } from '../types/risk';

interface GameOverModalProps {
  winner: Player;
  gameState: GameState;
  onOpenAiReview: () => void;
  onGoHome: () => void;
  onOpenHistory: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  gameState,
  onOpenAiReview,
  onGoHome,
  onOpenHistory
}) => {
  const isIsrael = gameState.mapType === 'israel';

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1624]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#15233a] border-2 border-[#273e63] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center overflow-hidden">
        {/* Glow backdrop */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: winner.color }}
        />

        {/* Trophy & Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-blue-900/30 border-2 border-blue-400 flex items-center justify-center shadow-xl">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-600/40 text-blue-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{isIsrael ? 'המערכה על ארץ ישראל הוכרעה!' : 'הכיבוש העולמי הושלם!'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {winner.name} ניצח בקרב!
          </h2>
          <p className="text-xs text-slate-300">
            {isIsrael 
              ? `שליטה מלאה בכל גזרות ומחוזות ישראל לאחר ${gameState.turn} תורות לחימה עיקשים.`
              : `שליטה מלאה בכל טריטוריות הגלובוס לאחר ${gameState.turn} תורות לחימה עיקשים.`}
          </p>
        </div>

        {/* Quick Battle Stats */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#121c2e] border border-[#233550] text-center">
          <div>
            <div className="text-[11px] text-slate-400">תורות</div>
            <div className="text-lg font-black text-white">{gameState.turn}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">מפקדים שהודחו</div>
            <div className="text-lg font-black text-amber-400">{gameState.players.length - 1}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">קרבות נרשמו</div>
            <div className="text-lg font-black text-sky-400">{gameState.logs.filter(l => l.type === 'attack' || l.type === 'conquer').length}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          {/* AI Review Button */}
          <button
            onClick={onOpenAiReview}
            className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-sm shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current text-white" />
            <span>צפה בתחקיר AI אסטרטגי מלא</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onOpenHistory}
              className="flex-1 py-3 rounded-xl bg-[#182842] hover:bg-[#1e3456] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#273e63]"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>היסטוריית משחקים</span>
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 py-3 rounded-xl bg-[#182842] hover:bg-[#1e3456] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#273e63]"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>חזור לחדר המערכה</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
