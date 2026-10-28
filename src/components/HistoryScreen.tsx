import React, { useState } from 'react';
import { 
  History, 
  Trophy, 
  Swords, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Calendar,
  Users,
  ShieldAlert
} from 'lucide-react';
import { GameRecord } from '../types/risk';
import { AiReviewModal } from './AiReviewModal';

interface HistoryScreenProps {
  history: GameRecord[];
  onBackToHome: () => void;
  onSaveAnalysis: (gameId: string, analysis: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onBackToHome,
  onSaveAnalysis
}) => {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );
  const [selectedGameForAi, setSelectedGameForAi] = useState<GameRecord | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">היסטוריית קרבות ומבצעים</h1>
            <p className="text-xs text-slate-400">מעקב אחר כל הקרבות, מנצחים וסקירות AI טקטיות</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזור לראשי</span>
        </button>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Swords className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">אין עדיין היסטוריית משחקים</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            השלם את המשחק הראשון שלך במצב מארח או אורח, ופרטי הקרב והסקירה הטקטית יישמרו כאן אוטומטית.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
          >
            פתח משחק ראשון
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((game) => {
            const isExpanded = expandedGameId === game.id;

            return (
              <div
                key={game.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg transition-all"
              >
                {/* Game Summary Row */}
                <div
                  onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20"
                      style={{ backgroundColor: game.winnerColor }}
                    >
                      <Trophy className="w-6 h-6 text-amber-200" />
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                          מנצח: <span style={{ color: game.winnerColor }}>{game.winnerName}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {game.roomCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{game.date}</span>
                        </span>
                        <span>•</span>
                        <span>{game.turns} תורות</span>
                        <span>•</span>
                        <span>{game.totalBattles} קרבות</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Prompt specified: (לחיצה על סקירת AI) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGameForAi(game);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>(לחיצה על סקירת AI)</span>
                    </button>

                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-right animate-in fade-in duration-150">
                    {/* Player Performances */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400">ביצועי השחקנים בקרב:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {game.playerPerformances.map((perf, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3 h-3 rounded-full border border-white/40"
                                style={{ backgroundColor: perf.color }}
                              />
                              <span className="font-bold text-white">{perf.name}</span>
                              {perf.eliminated && (
                                <span className="text-[10px] text-red-400">(הודח)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                              <span>נכבשו: <b className="text-emerald-400">{perf.territoriesWon}</b></span>
                              <span>אבדות: <b className="text-red-400">{perf.armiesLost}</b></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Events Timeline */}
                    {game.keyEvents && game.keyEvents.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-400">מהלכים ואירועים בולטים:</div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {game.keyEvents.map((event, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              <span>{event}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Review Banner inside expanded card */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedGameForAi(game)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>פתח סקירת AI מפורטת למשחק זה</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Review Modal */}
      {selectedGameForAi && (
        <AiReviewModal
          game={selectedGameForAi}
          onClose={() => setSelectedGameForAi(null)}
          onSaveAnalysis={onSaveAnalysis}
        />
      )}
    </div>
  );
};
