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
  SlidersHorizontal,
  Settings,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { PLAYER_COLORS, AI_BOT_NAMES } from '../data/riskMapData';
import { UserProfile, GameRecord, AiDifficulty, AiPersonality } from '../types/risk';

interface HomeScreenProps {
  userProfile: UserProfile;
  gameHistory: GameRecord[];
  onCreateGame: (config: {
    playersCount: number;
    hostColor: string;
    aiCount: number;
    aiDifficulty?: AiDifficulty;
    aiPersonality?: AiPersonality;
    aiDifficulties?: AiDifficulty[];
    aiPersonalities?: AiPersonality[];
    mapType?: 'world' | 'israel';
    autoStart?: boolean;
  }) => void;
  onJoinGame: (roomCode: string, onFail: (errMsg: string) => void) => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onSelectGameForReview?: (game: GameRecord) => void;
}

function getBotIntelDescription(diff: AiDifficulty, pers: AiPersonality): string {
  if (diff === 'hard') {
    if (pers === 'aggressive') return 'הערכת מודיעין: יריב אכזרי במיוחד! תוקף עד 7 פעמים בתור, מרכז כוחות בחזית ופורץ קווים ללא רחמים.';
    if (pers === 'defensive') return 'הערכת מודיעין: מעוז מבוצר! ריכוז כוחות מסיבי בגבולות וחומות הגנה בלתי חדירות.';
    return 'הערכת מודיעין: אסטרטג על! חישוב הסתברויות עמוק, כיבוש יבשות מדויק ותקיפות קטלניות בנקודות תורפה.';
  } else if (diff === 'easy') {
    if (pers === 'aggressive') return 'הערכת מודיעין: יריב מתחיל הנוטה להסתער בחוסר זהירות, עם עד 2 תקיפות לתור.';
    if (pers === 'defensive') return 'הערכת מודיעין: שחקן רגוע וזהיר, מתמקד בשמירה על עמדותיו וממעט לתקוף.';
    return 'הערכת מודיעין: יריב מאוזן ונוח למתחילים, תנועת כוחות שקטה ופיזור תגבורות רגוע.';
  } else {
    // medium
    if (pers === 'aggressive') return 'הערכת מודיעין: לוחם טקטי תוקפני, מנצל יתרון מספרי ומבצע עד 4 תקיפות ממוקדות.';
    if (pers === 'defensive') return 'הערכת מודיעין: מגן שקול, שומר על קווי הגבול של היבשות ומבצר עמדות מפתח.';
    return 'הערכת מודיעין: יריב מאוזן קלאסי, מחשב תגבורות, מגן על שטחים ומבצע עד 4 תקיפות מחושבות.';
  }
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

  // Solo AI setup modal state
  const [showSoloSetupModal, setShowSoloSetupModal] = useState(false);

  // Solo AI setup: 1 to 5 bots with separate difficulty AND personality per bot
  const [soloAiCount, setSoloAiCount] = useState(3);
  const [soloAiDifficulties, setSoloAiDifficulties] = useState<Record<number, AiDifficulty>>({
    0: 'medium',
    1: 'hard',
    2: 'easy',
    3: 'medium',
    4: 'hard',
  });
  const [soloAiPersonalities, setSoloAiPersonalities] = useState<Record<number, AiPersonality>>({
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

  // Host Multiplayer Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(4);
  const [selectedColor, setSelectedColor] = useState(userProfile.preferredColor || PLAYER_COLORS[0].hex);
  const [aiCount, setAiCount] = useState(3);
  const [hostAiDifficulties, setHostAiDifficulties] = useState<Record<number, AiDifficulty>>({
    0: 'medium',
    1: 'medium',
    2: 'medium',
    3: 'medium',
    4: 'medium',
  });
  const [hostAiPersonalities, setHostAiPersonalities] = useState<Record<number, AiPersonality>>({
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
    const difficulties = Array.from({ length: soloAiCount }, (_, i) => soloAiDifficulties[i] || 'medium');
    const personalities = Array.from({ length: soloAiCount }, (_, i) => soloAiPersonalities[i] || 'balanced');
    onCreateGame({
      playersCount: soloAiCount + 1,
      hostColor: selectedColor,
      aiCount: soloAiCount,
      aiDifficulty: difficulties[0],
      aiPersonality: personalities[0],
      aiDifficulties: difficulties,
      aiPersonalities: personalities,
      mapType: selectedMap,
      autoStart: true,
    });
    setShowSoloSetupModal(false);
  };

  const handleStartHostGame = () => {
    const count = Math.min(aiCount, totalPlayers - 1);
    const difficulties = Array.from({ length: count }, (_, i) => hostAiDifficulties[i] || 'medium');
    const personalities = Array.from({ length: count }, (_, i) => hostAiPersonalities[i] || 'balanced');
    onCreateGame({
      playersCount: totalPlayers,
      hostColor: selectedColor,
      aiCount: count,
      aiDifficulty: difficulties[0] || 'medium',
      aiPersonality: personalities[0] || 'balanced',
      aiDifficulties: difficulties,
      aiPersonalities: personalities,
      mapType: selectedMap,
      autoStart: false,
    });
    setShowCreateModal(false);
  };

  const setSoloBotDifficulty = (botIndex: number, diff: AiDifficulty) => {
    setSoloAiDifficulties(prev => ({
      ...prev,
      [botIndex]: diff
    }));
  };

  const setSoloBotPersonality = (botIndex: number, pers: AiPersonality) => {
    setSoloAiPersonalities(prev => ({
      ...prev,
      [botIndex]: pers
    }));
  };

  const setHostBotDifficulty = (botIndex: number, diff: AiDifficulty) => {
    setHostAiDifficulties(prev => ({
      ...prev,
      [botIndex]: diff
    }));
  };

  const setHostBotPersonality = (botIndex: number, pers: AiPersonality) => {
    setHostAiPersonalities(prev => ({
      ...prev,
      [botIndex]: pers
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
                  <span className="text-[11px] text-slate-300">קושי מותאם + דוקטרינות לכל בוט</span>
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

            {/* Per-AI Difficulty & Personality List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                  <span>בוטים במערכה:</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {soloAiCount === 1 ? 'דו-קרב 1 על 1' : `${soloAiCount} יריבים במערכה`}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-0.5">
                {Array.from({ length: soloAiCount }, (_, idx) => {
                  const botInfo = AI_BOT_NAMES[idx % AI_BOT_NAMES.length];
                  const currentDiff = soloAiDifficulties[idx] || 'medium';
                  const currentPers = soloAiPersonalities[idx] || 'balanced';

                  return (
                    <div 
                      key={idx} 
                      className="p-2 rounded-xl bg-[#0f1928] border border-[#23354f] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                          <span className="font-bold text-white truncate">{botInfo.name}</span>
                        </div>

                        {/* Quick difficulty toggle badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold">רמה:</span>
                          {[
                            { id: 'easy', label: 'קל' },
                            { id: 'medium', label: 'בינוני' },
                            { id: 'hard', label: 'קשה' },
                          ].map(diff => (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => setSoloBotDifficulty(idx, diff.id as AiDifficulty)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                currentDiff === diff.id
                                  ? diff.id === 'hard'
                                    ? 'bg-[#dc2626] text-white border-red-500 font-black shadow'
                                    : diff.id === 'medium'
                                    ? 'bg-[#2563eb] text-white border-blue-400 font-black shadow'
                                    : 'bg-emerald-600 text-white border-emerald-400 font-black shadow'
                                  : 'bg-[#15233a] text-slate-400 border-[#273d61] hover:text-slate-200'
                              }`}
                            >
                              {diff.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick doctrine / personality toggle */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1c2e47]">
                        <span className="text-[10px] text-slate-400 font-bold">דוקטרינה:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'balanced', label: 'מאוזן' },
                            { id: 'aggressive', label: 'הסתערות' },
                            { id: 'defensive', label: 'מבוצר' },
                          ].map(pers => (
                            <button
                              key={pers.id}
                              type="button"
                              onClick={() => setSoloBotPersonality(idx, pers.id as AiPersonality)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                currentPers === pers.id
                                  ? pers.id === 'aggressive'
                                    ? 'bg-amber-600 text-white border-amber-400 font-black shadow'
                                    : pers.id === 'defensive'
                                    ? 'bg-teal-700 text-white border-teal-500 font-black shadow'
                                    : 'bg-indigo-700 text-white border-indigo-500 font-black shadow'
                                  : 'bg-[#15233a] text-slate-400 border-[#273d61] hover:text-slate-200'
                              }`}
                            >
                              {pers.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* Open Dedicated Setup Window button */}
            <button
              type="button"
              onClick={() => setShowSoloSetupModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1b2b45] hover:bg-[#23385a] border border-[#2d4974] text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-red-400" />
              <span>⚙️ פתח חלון הגדרות קרב AI מלא (פירוט קושי + דוקטרינות)</span>
            </button>

            {/* Direct launch button */}
            <button
              onClick={handleStartSolo}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>הזנק קרב סולו ({soloAiCount === 1 ? 'דו-קרב 1 על 1' : `אתה נגד ${soloAiCount} בוטים`})</span>
            </button>
          </div>
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

            {/* Per-AI difficulty & personality list in Host modal */}
            {aiCount > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300">הגדרת רמה ודוקטרינה לכל בוט בחדר:</label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-0.5">
                  {Array.from({ length: Math.min(aiCount, totalPlayers - 1) }, (_, idx) => {
                    const botInfo = AI_BOT_NAMES[idx % AI_BOT_NAMES.length];
                    const currentDiff = hostAiDifficulties[idx] || 'medium';
                    const currentPers = hostAiPersonalities[idx] || 'balanced';

                    return (
                      <div key={idx} className="p-2 rounded-xl bg-[#0f1928] border border-[#23354f] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px] truncate">{botInfo.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">רמה:</span>
                            {[
                              { id: 'easy', label: 'קל' },
                              { id: 'medium', label: 'בינוני' },
                              { id: 'hard', label: 'קשה' },
                            ].map(diff => (
                              <button
                                key={diff.id}
                                type="button"
                                onClick={() => setHostBotDifficulty(idx, diff.id as AiDifficulty)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  currentDiff === diff.id
                                    ? diff.id === 'hard'
                                      ? 'bg-[#dc2626] text-white border-red-500 font-black'
                                      : diff.id === 'medium'
                                      ? 'bg-[#2563eb] text-white border-blue-400 font-black'
                                      : 'bg-emerald-600 text-white border-emerald-400 font-black'
                                    : 'bg-[#15233a] text-slate-400 border-[#273d61]'
                                }`}
                              >
                                {diff.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#1b2c45]">
                          <span className="text-[10px] text-slate-400 font-bold">דוקטרינה:</span>
                          <div className="flex items-center gap-1">
                            {[
                              { id: 'balanced', label: 'מאוזן' },
                              { id: 'aggressive', label: 'הסתערות' },
                              { id: 'defensive', label: 'מבוצר' },
                            ].map(pers => (
                              <button
                                key={pers.id}
                                type="button"
                                onClick={() => setHostBotPersonality(idx, pers.id as AiPersonality)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  currentPers === pers.id
                                    ? pers.id === 'aggressive'
                                      ? 'bg-amber-600 text-white border-amber-400 font-black'
                                      : pers.id === 'defensive'
                                      ? 'bg-teal-700 text-white border-teal-500 font-black'
                                      : 'bg-indigo-700 text-white border-indigo-500 font-black'
                                    : 'bg-[#15233a] text-slate-400 border-[#273d61]'
                                }`}
                              >
                                {pers.label}
                              </button>
                            ))}
                          </div>
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

      {/* Dedicated AI Game Setup Window (Modal) */}
      {showSoloSetupModal && (
        <div className="fixed inset-0 z-50 bg-[#070d18]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#121e33] border border-[#2a456e] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-right overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1c3050] bg-[#16253e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-700/50">
                      חלון הגדרת קרב AI טקטי
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-cinzel mt-0.5">
                    הגדרת מערכת סולו מול AI
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSoloSetupModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0f1928] hover:bg-[#1c2e4a] border border-[#23354f] text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-140px)]">
              {/* Theater selection */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span>🌍</span>
                    <span>בחר זירת לחימה:</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {selectedMap === 'world' ? 'מפת העולם הקלאסית' : 'מפת ישראל ומערכות ההגנה'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMap('world')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      selectedMap === 'world'
                        ? 'bg-[#1e3a6a] border-blue-400 shadow-md ring-1 ring-blue-400'
                        : 'bg-[#0c1626] border-[#223756] hover:bg-[#14233a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">🌍</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedMap === 'world' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        42 ארצות
                      </span>
                    </div>
                    <div className="text-xs font-black text-white">מפת העולם</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">6 יבשות, מאבקי שליטה עולמיים</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMap('israel')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      selectedMap === 'israel'
                        ? 'bg-[#4a1818] border-red-400 shadow-md ring-1 ring-red-400'
                        : 'bg-[#0c1626] border-[#223756] hover:bg-[#14233a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">🇮🇱</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedMap === 'israel' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        18 מחוזות
                      </span>
                    </div>
                    <div className="text-xs font-black text-white">מפת ישראל</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">4 פיקודים, עוטף עזה, גבולות ומרחבים</div>
                  </button>
                </div>
              </div>

              {/* Bot Count Selector */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-red-400" />
                    <span>מספר יריבי AI במערכה:</span>
                  </span>
                  <span className="text-red-400 font-bold font-mono text-xs">
                    {soloAiCount === 1 ? 'דו-קרב (1 על 1)' : `${soloAiCount} בוטים (סך הכל ${soloAiCount + 1} צבאות)`}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSoloAiCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        soloAiCount === cnt
                          ? 'bg-red-600 text-white border-red-400 font-black shadow-md ring-1 ring-red-400 scale-[1.02]'
                          : 'bg-[#0c1626] text-slate-300 border-[#223756] hover:bg-[#14233a]'
                      }`}
                    >
                      {cnt === 1 ? '1 (דו-קרב)' : `${cnt} בוטים`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-Bot Dual Configuration: Difficulty + Doctrine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-red-400" />
                    <span>הגדרת רמת קושי ודוקטרינת קרב לכל בוט בנפרד:</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    הקושי קובע עומק חישוב והתקפות, הדוקטרינה קובעת אופי צבאי
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Array.from({ length: soloAiCount }, (_, idx) => {
                    const botInfo = AI_BOT_NAMES[idx % AI_BOT_NAMES.length];
                    const currentDiff = soloAiDifficulties[idx] || 'medium';
                    const currentPers = soloAiPersonalities[idx] || 'balanced';
                    const intelText = getBotIntelDescription(currentDiff, currentPers);

                    return (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-2xl bg-[#0c1626] border border-[#233b5e] space-y-2.5 shadow-sm"
                      >
                        {/* Bot header */}
                        <div className="flex items-center justify-between border-b border-[#1b2d47] pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-red-950/70 border border-red-700/50 flex items-center justify-center text-red-400 text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{botInfo.name}</span>
                                <span className="text-[10px] text-slate-400">· יריב {idx + 1}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                            <span className={
                              currentDiff === 'hard' ? 'text-red-400 font-bold' :
                              currentDiff === 'medium' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'
                            }>
                              {currentDiff === 'hard' ? 'קשה' : currentDiff === 'medium' ? 'בינוני' : 'קל'}
                            </span>
                            <span>/</span>
                            <span className={
                              currentPers === 'aggressive' ? 'text-amber-400 font-bold' :
                              currentPers === 'defensive' ? 'text-teal-400 font-bold' : 'text-indigo-400 font-bold'
                            }>
                              {currentPers === 'aggressive' ? 'הסתערות' : currentPers === 'defensive' ? 'מבוצר' : 'מאוזן'}
                            </span>
                          </div>
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* 1. Difficulty Level Selector */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                              <span>רמת קושי (עומק ומספר התקפות):</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'easy', label: '🟢 קל', sub: 'עד 2 התקפות' },
                                { id: 'medium', label: '🔵 בינוני', sub: 'עד 4 התקפות' },
                                { id: 'hard', label: '🔴 קשה', sub: 'עד 7 התקפות' },
                              ].map(diff => (
                                <button
                                  key={diff.id}
                                  type="button"
                                  onClick={() => setSoloBotDifficulty(idx, diff.id as AiDifficulty)}
                                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                    currentDiff === diff.id
                                      ? diff.id === 'hard'
                                        ? 'bg-[#dc2626] text-white border-red-500 font-black shadow'
                                        : diff.id === 'medium'
                                        ? 'bg-[#2563eb] text-white border-blue-400 font-black shadow'
                                        : 'bg-emerald-600 text-white border-emerald-400 font-black shadow'
                                      : 'bg-[#15233a] text-slate-400 border-[#223652] hover:text-white'
                                  }`}
                                >
                                  <div className="font-bold text-xs">{diff.label}</div>
                                  <div className="text-[9px] opacity-80">{diff.sub}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Doctrine / Personality Selector */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                              <span>דוקטרינה צבאית (אופי לחימה):</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'balanced', label: '⚖️ מאוזן', sub: 'איזון יבשות' },
                                { id: 'aggressive', label: '⚔️ הסתערות', sub: 'לחץ קדמי' },
                                { id: 'defensive', label: '🛡️ מבוצר', sub: 'ביצור גבול' },
                              ].map(pers => (
                                <button
                                  key={pers.id}
                                  type="button"
                                  onClick={() => setSoloBotPersonality(idx, pers.id as AiPersonality)}
                                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                    currentPers === pers.id
                                      ? pers.id === 'aggressive'
                                        ? 'bg-amber-600 text-white border-amber-400 font-black shadow'
                                        : pers.id === 'defensive'
                                        ? 'bg-teal-700 text-white border-teal-500 font-black shadow'
                                        : 'bg-indigo-700 text-white border-indigo-500 font-black shadow'
                                      : 'bg-[#15233a] text-slate-400 border-[#223652] hover:text-white'
                                  }`}
                                >
                                  <div className="font-bold text-xs">{pers.label}</div>
                                  <div className="text-[9px] opacity-80">{pers.sub}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Tactical Intel Readout Box */}
                        <div className="p-2 rounded-xl bg-[#09111c] border border-[#1e3452] flex items-start gap-2 text-[11px] text-slate-300">
                          <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{intelText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commander Army Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-200">בחר את צבע הצבא שלך (מפקד):</label>
                <div className="grid grid-cols-6 gap-2">
                  {PLAYER_COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                        selectedColor === color.hex
                          ? 'scale-105 shadow-lg border-white ring-2 ring-red-400'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.hex && (
                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0e1726] border-t border-[#1c3050] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300 text-center sm:text-right">
                <span className="font-bold text-white">סיכום מערכה:</span>{' '}
                <span>{selectedMap === 'israel' ? 'מפת ישראל (18)' : 'מפת העולם (42)'}</span>{' '}
                <span>·</span>{' '}
                <span>אתה נגד {soloAiCount} בוטים</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowSoloSetupModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#14233a] hover:bg-[#1c2e4a] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleStartSolo}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>הזנק מערכה סולו 🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
