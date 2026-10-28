import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Award, RefreshCw, Copy, Check, ShieldCheck, Swords } from 'lucide-react';
import { GameRecord } from '../types/risk';

interface AiReviewModalProps {
  game: GameRecord;
  onClose: () => void;
  onSaveAnalysis?: (gameId: string, analysis: string) => void;
}

export const AiReviewModal: React.FC<AiReviewModalProps> = ({
  game,
  onClose,
  onSaveAnalysis
}) => {
  const [analysisText, setAnalysisText] = useState<string>(game.aiAnalysis || '');
  const [isLoading, setIsLoading] = useState<boolean>(!game.aiAnalysis);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!game.aiAnalysis) {
      fetchAnalysis();
    }
  }, [game.id]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSummary: {
            winnerName: game.winnerName,
            winnerColor: game.winnerColor,
            playersCount: game.playersCount,
            turns: game.turns,
            totalBattles: game.totalBattles,
            attackerCasualties: game.attackerCasualties,
            defenderCasualties: game.defenderCasualties,
            playerPerformances: game.playerPerformances,
            keyEvents: game.keyEvents
          }
        })
      });

      const data = await response.json();
      const text = data.analysis || 'הניתוח הטקטי הושלם בהצלחה.';
      setAnalysisText(text);
      if (onSaveAnalysis) {
        onSaveAnalysis(game.id, text);
      }
    } catch (e) {
      console.error(e);
      setAnalysisText('לא ניתן היה לטעון את סקירת ה-AI כעת. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-right max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                ניתוח אסטרטגי צבאי מבוסס AI
              </div>
              <h3 className="text-xl font-black text-white">סקירת AI טקטית של המשחק</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick match metadata header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
          <div>
            <span className="text-slate-400">מנצח:</span>{' '}
            <span className="font-bold text-white" style={{ color: game.winnerColor }}>
              {game.winnerName}
            </span>
          </div>
          <div>
            <span className="text-slate-400">תורות:</span>{' '}
            <span className="font-bold text-white font-mono">{game.turns}</span>
          </div>
          <div>
            <span className="text-slate-400">סך קרבות:</span>{' '}
            <span className="font-bold text-white font-mono">{game.totalBattles}</span>
          </div>
          <div>
            <span className="text-slate-400">תאריך:</span>{' '}
            <span className="font-bold text-white font-mono">{game.date}</span>
          </div>
        </div>

        {/* AI Output Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm leading-relaxed text-slate-200">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-bold text-white">מעבד נתוני קרב ומפיק סקירת AI...</div>
              <div className="text-xs text-slate-400">מנתח החלטות טקטיות, קווי הגנה ותנועות כוחות</div>
            </div>
          ) : (
            <div className="whitespace-pre-line space-y-3 font-sans">
              {analysisText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 shrink-0">
          <button
            onClick={fetchAnalysis}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>הפק ניתוח מחדש</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'הועתק!' : 'העתק ניתוח'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
