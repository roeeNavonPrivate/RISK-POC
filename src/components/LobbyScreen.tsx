import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Play, 
  Clock, 
  Shield, 
  Bot, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Player } from '../types/risk';
import { PLAYER_COLORS } from '../data/riskMapData';

interface LobbyScreenProps {
  roomCode: string;
  isHost: boolean;
  currentPlayerId: string;
  players: Player[];
  maxPlayers: number;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  onToggleReady: (playerId: string) => void;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomCode,
  isHost,
  currentPlayerId,
  players,
  maxPlayers,
  onUpdatePlayer,
  onToggleReady,
  onStartGame,
  onLeaveLobby
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const humanPlayers = players.filter(p => !p.isAi);
  const allHumanReady = humanPlayers.every(p => p.isReady || p.isHost);
  const canStart = isHost && players.length >= 2 && allHumanReady;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Color selection for current player
  const handleColorSelect = (hex: string) => {
    if (!currentPlayer) return;
    // Check if color is taken by another player
    const isTaken = players.some(p => p.id !== currentPlayer.id && p.color === hex);
    if (!isTaken) {
      onUpdatePlayer(currentPlayer.id, { color: hex });
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentPlayer) return;
    onUpdatePlayer(currentPlayer.id, { name: e.target.value.trim() || 'שחקן' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Lobby Header & Room Code Display */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>חדר מבצעים טקטי</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              לובי המשחק: <span className="text-amber-400 font-mono tracking-wider">{roomCode}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isHost 
                ? 'שתף את קוד החדר עם חבריך והמתן שיהיו מוכנים כדי להתחיל את המשחק.'
                : 'בחר כינוי וצבע, סמן שאתה מוכן, והמתן שהמארח יזניק את המשחק.'}
            </p>
          </div>

          {/* Quick share buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedCode ? 'הקוד הועתק!' : 'העתק קוד'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-blue-400" />}
              <span>{copiedLink ? 'הקישור הועתק!' : 'שתף קישור'}</span>
            </button>
          </div>
        </div>

        {/* Current Player Customizer (Nickname & Color) */}
        {currentPlayer && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ההגדרות שלך:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentPlayer.name}
                    onChange={handleNicknameChange}
                    maxLength={18}
                    placeholder="הזן כינוי קרבי"
                    className="bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-white font-bold text-sm focus:outline-none"
                  />
                  {currentPlayer.isHost && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-black border border-amber-500/30">
                      מארח (HOST)
                    </span>
                  )}
                </div>
              </div>

              {/* Ready status toggle for Guest */}
              {!currentPlayer.isHost && (
                <button
                  onClick={() => onToggleReady(currentPlayer.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer ${
                    currentPlayer.isReady
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentPlayer.isReady ? 'מוכן לקרב!' : 'לחץ לסימון מוכן'}</span>
                </button>
              )}
            </div>

            {/* Color selection */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400">בחר צבע לצבא שלך:</span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {PLAYER_COLORS.map(col => {
                  const isTaken = players.some(p => p.id !== currentPlayer.id && p.color === col.hex);
                  const isSelected = currentPlayer.color === col.hex;

                  return (
                    <button
                      key={col.id}
                      type="button"
                      disabled={isTaken}
                      onClick={() => handleColorSelect(col.hex)}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                        isSelected 
                          ? 'scale-110 border-white ring-2 ring-amber-400 shadow-md' 
                          : isTaken
                            ? 'opacity-25 cursor-not-allowed border-slate-800'
                            : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={isTaken ? `${col.name} (תפוס)` : col.name}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Players List in Room */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>שחקנים בחדר ({players.length}/{maxPlayers}):</span>
            <span>סטטוס מוכנות</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.isAi ? <Bot className="w-5 h-5 text-white/90" /> : player.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {player.isHost && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          מארח
                        </span>
                      )}
                      {player.isAi && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {player.isAi 
                        ? (player.aiPersonality === 'aggressive' ? 'בוט אגרסיבי' : 'בוט טקטי')
                        : (player.id === currentPlayerId ? 'אתה' : 'שחקן אורח')}
                    </div>
                  </div>
                </div>

                <div>
                  {player.isHost ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                      מארח
                    </span>
                  ) : player.isAi ? (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
                      מוכן אוטומטית
                    </span>
                  ) : player.isReady ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>מוכן!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ממתין...</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action Banner */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onLeaveLobby}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>עזוב חדר וחזור לראשי</span>
          </button>

          {isHost ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {!allHumanReady && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>ממתין שכל השחקנים האנושיים יסמנו מוכן</span>
                </div>
              )}
              <button
                disabled={!canStart}
                onClick={onStartGame}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-base shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>התחל משחק עכשיו</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>ממתין שהמארח יתחיל את המשחק...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
