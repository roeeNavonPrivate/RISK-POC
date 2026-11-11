import React, { useState } from 'react';
import { 
  Users, 
  Bot, 
  Award, 
  Swords, 
  History, 
  AlertCircle,
  Play,
  BookOpen,
  PlusCircle,
  LogIn,
  SlidersHorizontal
} from 'lucide-react';
import { PLAYER_COLORS, AI_BOT_NAMES } from '../data/riskMapData';
import { UserProfile, GameRecord } from '../types/risk';

interface HomeScreenProps {
  userProfile: UserProfile;
  gameHistory: GameRecord[];
  onCreateGame: (config: {
    playersCount: number;
    hostColor: string;
    aiCount: number;
    aiDifficulty?: 'balanced' | 'aggressive' | 'defensive';
    aiPersonalities?: Array<'balanced' | 'aggressive' | 'defensive'>;
    mapType?: 'world' | 'israel';
    autoStart?: boolean;
  }) => void;
  onJoinGame: (roomCode: string, onFail: (errMsg: string) => void) => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onSelectGameForReview?: (game: GameRecord) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  gameHistory,
  onCreateGame,
  onJoinGame,
  onOpenHistory,
  onOpenProfile,
  onOpenRules,
  onSelectGameForReview,
}) => {
  // Map theater: 'world' vs 'israel'
  const [selectedMap, setSelectedMap] = useState<'world' | 'israel'>('world');

  // Solo AI setup
  const [soloAiCount, setSoloAiCount] = useState(3);
  const [soloAiPersonalities, setSoloAiPersonalities] = useState<Record<number, 'balanced' | 'aggressive' | 'defensive'>>({
    0: 'balanced',
    1: 'aggressive',
    2: 'defensive',
    3: 'balanced',
    4: 'aggressive',
  });

  // Join Room state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Host Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(4);
  const [selectedColor, setSelectedColor] = useState(userProfile.preferredColor || PLAYER_COLORS[0].hex);
  const [aiCount, setAiCount] = useState(3);
  const [hostAiPersonalities, setHostAiPersonalities] = useState<Record<number, 'balanced' | 'aggressive' | 'defensive'>>({
    0: 'balanced',
    1: 'balanced',
    2: 'balanced',
    3: 'balanced',
    4: 'balanced',
  });

  const winPercentage = userProfile.gamesPlayed > 0 
    ? Math.round((userProfile.gamesWon / userProfile.gamesPlayed) * 100) 
    : 0;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError('נא להזין קוד חדר');
      return;
    }
    setJoinError('');
    setIsJoining(true);

    onJoinGame(code, (errorMsg) => {
      setIsJoining(false);
      setJoinError(errorMsg);
    });
  };

  const handleStartSolo = () => {
    const personalities = Array.from({ length: soloAiCount }, (_, i) => soloAiPersonalities[i] || 'balanced');
    onCreateGame({
      playersCount: soloAiCount + 1,
      hostColor: selectedColor,
      aiCount: soloAiCount,
      aiDifficulty: personalities[0],
      aiPersonalities: personalities,
      mapType: selectedMap,
      autoStart: true,
    });
  };

  const handleStartHostGame = () => {
    const count = Math.min(aiCount, totalPlayers - 1);
    const personalities = Array.from({ length: count }, (_, i) => hostAiPersonalities[i] || 'balanced');
    onCreateGame({
      playersCount: totalPlayers,
      hostColor: selectedColor,
      aiCount: count,
      aiDifficulty: personalities[0] || 'balanced',
      aiPersonalities: personalities,
      mapType: selectedMap,
      autoStart: false,
    });
    setShowCreateModal(false);
  };

  const setSoloBotPersonality = (botIndex: number, diff: 'balanced' | 'aggressive' | 'defensive') => {
    setSoloAiPersonalities(prev => ({
      ...prev,
      [botIndex]: diff
    }));
  };

  const setHostBotPersonality = (botIndex: number, diff: 'balanced' | 'aggressive' | 'defensive') => {
    setHostAiPersonalities(prev => ({
      ...prev,
      [botIndex]: diff
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      {/* 1. Header & Theater Switcher */}
      <div className="rounded-2xl border border-[#273d61] bg-[#15233a] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
            <span className="text-[#3b82f6]">חדר פיקוד עליון</span>
            <span>·</span>
            <span>{userProfile.nickname} ({userProfile.rankTitle})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-cinzel mt-1">
            סיכון · RISK
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            בחר זירת לחימה והתחל בכיבוש הלוח
          </p>
        </div>

        {/* Map Theater Toggle */}
        <div className="bg-[#0f1928] p-1.5 rounded-xl border border-[#23354f] flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedMap('world')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMap === 'world'
                ? 'bg-[#2563eb] text-white shadow font-black'
                : 'text-slate-300 hover:text-white hover:bg-[#18263c]'
            }`}
          >
            <span>🌍</span>
            <span>מפת העולם (42)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMap('israel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMap === 'israel'
                ? 'bg-[#dc2626] text-white shadow font-black'
                : 'text-slate-300 hover:text-white hover:bg-[#18263c]'
            }`}
          >
            <span>🇮🇱</span>
            <span>מפת ישראל (18)</span>
          </button>
        </div>
      </div>

      {/* 2. Core Game Modes: Solo vs AI & Play with Friends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mode A: Solo vs AI (Red Theme) */}
        <div className="rounded-2xl border border-[#dc2626]/40 bg-[#15233a] p-5 sm:p-6 flex flex-col justify-between shadow-lg hover:border-[#dc2626]/70 transition-all space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#243550] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#dc2626]/20 border border-[#dc2626]/40 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-cinzel">משחק נגד AI (סולו)</h2>
                  <span className="text-[11px] text-slate-300">בחר רמת קושי ייעודית לכל בוט</span>
                </div>
              </div>

              {/* Bot count selector */}
              <div className="flex items-center gap-1 bg-[#0f1928] p-1 rounded-lg border border-[#23354f]">
                {[1, 2, 3, 4, 5].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setSoloAiCount(cnt)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      soloAiCount === cnt
                        ? 'bg-[#dc2626] text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt === 1 ? '1 (דו-קרב)' : cnt}
                  </button>
                ))}
                <span className="text-[10px] text-slate-500 pr-1">בוטים</span>
              </div>
            </div>

            {/* Per-AI Difficulty List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                  <span>הגדרת רמת קושי לכל בוט בנפרד:</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {soloAiCount === 1 ? 'קרב 1 על 1' : `${soloAiCount} יריבים במערכה`}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-0.5">
                {Array.from({ length: soloAiCount }, (_, idx) => {
                  const botInfo = AI_BOT_NAMES[idx % AI_BOT_NAMES.length];
                  const currentDiff = soloAiPersonalities[idx] || 'balanced';
                  return (
                    <div 
                      key={idx} 
                      className="p-2 rounded-xl bg-[#0f1928] border border-[#23354f] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                        <span className="font-bold text-white truncate">{botInfo.name}</span>
                      </div>

                      {/* 3 difficulty buttons for this bot */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[
                          { id: 'balanced', label: 'מאוזן' },
                          { id: 'aggressive', label: 'הסתערות' },
                          { id: 'defensive', label: 'מבוצר' },
                        ].map(diff => (
                          <button
                            key={diff.id}
                            type="button"
                            onClick={() => setSoloBotPersonality(idx, diff.id as any)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                              currentDiff === diff.id
                                ? diff.id === 'aggressive'
                                  ? 'bg-[#dc2626] text-white border-red-500 font-black shadow'
                                  : diff.id === 'defensive'
                                  ? 'bg-blue-700 text-white border-blue-500 font-black shadow'
                                  : 'bg-emerald-700 text-white border-emerald-500 font-black shadow'
                                : 'bg-[#15233a] text-slate-400 border-[#273d61] hover:text-slate-200'
                            }`}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartSolo}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>התחל קרב סולו ({soloAiCount === 1 ? 'דו-קרב 1 על 1' : `אתה נגד ${soloAiCount} בוטים`})</span>
          </button>
        </div>

        {/* Mode B: Play with Friends (Blue Theme) */}
        <div className="rounded-2xl border border-[#2563eb]/40 bg-[#15233a] p-5 sm:p-6 flex flex-col justify-between shadow-lg hover:border-[#2563eb]/70 transition-all space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#243550] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center text-white">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-cinzel">משחק נגד חברים</h2>
                  <span className="text-[11px] text-slate-300">חדר מולטיפלייר ברשת בזמן אמת</span>
                </div>
              </div>
            </div>

            {/* Host room button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>פתח חדר חדש (מארח)</span>
            </button>

            {/* Join Room Form */}
            <form onSubmit={handleJoinSubmit} className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300">הצטרפות לחדר קיים בקוד:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="RISK-XXXX"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  className="flex-1 bg-[#0f1928] border border-[#23354f] focus:border-blue-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-center tracking-wider text-xs font-bold focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-4 py-2 rounded-xl bg-[#1e3456] hover:bg-[#25426e] border border-[#2e4c7a] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isJoining ? '...' : 'הצטרף'}</span>
                </button>
              </div>
              {joinError && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-950/60 border border-red-700/50 text-red-300 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}
            </form>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            2 עד 6 שחקנים · תמיכה בחיבור מחשב וטלפון
          </div>
        </div>
      </div>

      {/* 3. Button for Profile with Live Stats Inside */}
      <button
        onClick={onOpenProfile}
        className="w-full rounded-2xl border border-[#273d61] hover:border-amber-500/60 bg-[#15233a] hover:bg-[#1a2c48] p-4 sm:p-5 transition-all text-right shadow-lg cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20 shrink-0"
            style={{ backgroundColor: userProfile.preferredColor }}
          >
            {userProfile.nickname.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">{userProfile.rankTitle}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">פרופיל מפקד וסטטיסטיקות</span>
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
              {userProfile.nickname}
            </h3>
          </div>
        </div>

        {/* Embedded Stats Chips inside the Profile Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#0f1928] border border-[#23354f] flex items-center gap-1.5 text-slate-200">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{userProfile.gamesWon} ניצחונות מתוך {userProfile.gamesPlayed}</span>
            <span className="text-emerald-400 font-bold">({winPercentage}%)</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0f1928] border border-[#23354f] flex items-center gap-1.5 text-slate-200">
            <span className="text-sky-400">🌍</span>
            <span>{userProfile.territoriesConquered || 0} שטחים נכבשו</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0f1928] border border-[#23354f] flex items-center gap-1.5 text-slate-200">
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span>{userProfile.armiesDefeated || 0} חיילים הוכנעו</span>
          </div>

          <div className="text-amber-400 text-xs font-bold group-hover:translate-x-[-2px] transition-transform">
            לפרופיל המלא ⟵
          </div>
        </div>
      </button>

      {/* 4. One Button for Rules & One Button for Journal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* One Button for Rules */}
        <button
          onClick={onOpenRules}
          className="flex items-center justify-between p-4 rounded-xl bg-[#15233a] hover:bg-[#1c2e4a] border border-[#273d61] hover:border-sky-400/60 text-slate-200 hover:text-white transition-all cursor-pointer shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18263c] border border-[#2a4060] flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-white">חוקי המשחק</div>
              <div className="text-[11px] text-slate-400">תגבורות, קוביות קרב, כיבושים וביצורים</div>
            </div>
          </div>
          <span className="text-xs text-sky-400 font-bold group-hover:translate-x-[-2px] transition-transform">עיין ⟵</span>
        </button>

        {/* One Button for Journal */}
        <button
          onClick={onOpenHistory}
          className="flex items-center justify-between p-4 rounded-xl bg-[#15233a] hover:bg-[#1c2e4a] border border-[#273d61] hover:border-blue-400/60 text-slate-200 hover:text-white transition-all cursor-pointer shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18263c] border border-[#2a4060] flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-white">
                יומן קרבות {gameHistory.length > 0 && `(${gameHistory.length})`}
              </div>
              <div className="text-[11px] text-slate-400">היסטוריית מערכות ותחקיר AI אסטרטגי</div>
            </div>
          </div>
          <span className="text-xs text-blue-400 font-bold group-hover:translate-x-[-2px] transition-transform">ליומן ⟵</span>
        </button>
      </div>

      {/* Host Create Multiplayer Game Modal with Per-AI Difficulty */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0a101a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15233a] border border-[#273e63] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-right">
            <div className="flex items-center justify-between border-b border-[#213554] pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white font-cinzel">הגדרת חדר משחק נגד חברים</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Theater / Map Selection for Host */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">זירת לחימה:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMap('world')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMap === 'world'
                      ? 'bg-[#2563eb] text-white border-blue-400 font-black shadow'
                      : 'bg-[#0f1928] text-slate-300 border-[#23354f] hover:bg-[#18263c]'
                  }`}
                >
                  <span>🌍</span>
                  <span>מפת העולם (42)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMap('israel')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMap === 'israel'
                      ? 'bg-[#dc2626] text-white border-red-400 font-black shadow'
                      : 'bg-[#0f1928] text-slate-300 border-[#23354f] hover:bg-[#18263c]'
                  }`}
                >
                  <span>🇮🇱</span>
                  <span>מפת ישראל (18)</span>
                </button>
              </div>
            </div>

            {/* Total Players Selection */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>מספר שחקנים כולל:</span>
                <span className="text-blue-400 font-mono font-bold">{totalPlayers}</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTotalPlayers(num);
                      if (aiCount >= num) setAiCount(num - 1);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      totalPlayers === num
                        ? 'bg-[#2563eb] text-white border-blue-400 font-black shadow'
                        : 'bg-[#0f1928] text-slate-300 border-[#23354f] hover:bg-[#18263c]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Bots count */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>השלמת מקומות בבוטים:</span>
                <span className="text-slate-300 font-mono text-xs font-bold">
                  {aiCount} בוטים ({totalPlayers - aiCount} חברים)
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPlayers }, (_, idx) => idx).map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setAiCount(cnt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      aiCount === cnt
                        ? 'bg-[#1e3a8a] text-white border-blue-500 font-black'
                        : 'bg-[#0f1928] text-slate-400 border-[#23354f] hover:bg-[#18263c]'
                    }`}
                  >
                    {cnt === 0 ? 'ללא' : `${cnt}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-AI difficulty list in Host modal */}
            {aiCount > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300">רמת קושי לכל בוט בחדר:</label>
                <div className="space-y-1 max-h-[120px] overflow-y-auto pr-0.5">
                  {Array.from({ length: Math.min(aiCount, totalPlayers - 1) }, (_, idx) => {
                    const botInfo = AI_BOT_NAMES[idx % AI_BOT_NAMES.length];
                    const currentDiff = hostAiPersonalities[idx] || 'balanced';
                    return (
                      <div key={idx} className="p-1.5 rounded-lg bg-[#0f1928] border border-[#23354f] flex items-center justify-between text-xs">
                        <span className="font-bold text-white text-[11px] truncate">{botInfo.name}</span>
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'balanced', label: 'מאוזן' },
                            { id: 'aggressive', label: 'הסתערות' },
                            { id: 'defensive', label: 'מבוצר' },
                          ].map(diff => (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => setHostBotPersonality(idx, diff.id as any)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                currentDiff === diff.id
                                  ? 'bg-blue-600 text-white border-blue-400 font-black'
                                  : 'bg-[#15233a] text-slate-400 border-[#273d61]'
                              }`}
                            >
                              {diff.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Host Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">צבע הצבא שלך:</label>
              <div className="grid grid-cols-6 gap-2">
                {PLAYER_COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
                      selectedColor === color.hex
                        ? 'scale-105 shadow-md border-white ring-2 ring-blue-400'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <span className="w-2 h-2 rounded-full bg-white shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0f1928] hover:bg-[#18263c] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleStartHostGame}
                className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                פתח חדר
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
