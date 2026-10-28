import React, { useState } from 'react';
import { 
  PlusCircle, 
  LogIn, 
  Users, 
  Bot, 
  Award, 
  Swords, 
  History, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  Play
} from 'lucide-react';
import { PLAYER_COLORS, PlayerColorDef } from '../data/riskMapData';
import { UserProfile, GameRecord } from '../types/risk';
import heroMapBg from '../assets/images/risk_world_map_1793198572865.jpg';

interface HomeScreenProps {
  userProfile: UserProfile;
  gameHistory: GameRecord[];
  onCreateGame: (config: {
    playersCount: number;
    hostColor: string;
    aiCount: number;
    aiDifficulty: 'balanced' | 'aggressive' | 'defensive';
  }) => void;
  onJoinGame: (roomCode: string, onFail: (errMsg: string) => void) => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onSelectGameForReview: (game: GameRecord) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  gameHistory,
  onCreateGame,
  onJoinGame,
  onOpenHistory,
  onOpenProfile,
  onOpenRules,
  onSelectGameForReview
}) => {
  // Join Game state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Create Game Modal/Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(4);
  const [selectedColor, setSelectedColor] = useState(userProfile.preferredColor || PLAYER_COLORS[0].hex);
  const [aiCount, setAiCount] = useState(3);
  const [aiPersonality, setAiPersonality] = useState<'balanced' | 'aggressive' | 'defensive'>('balanced');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError('נא להזין קוד משחק');
      return;
    }
    setJoinError('');
    setIsJoining(true);

    onJoinGame(code, (errorMsg) => {
      setIsJoining(false);
      setJoinError(errorMsg);
    });
  };

  const handleStartCreate = () => {
    onCreateGame({
      playersCount: totalPlayers,
      hostColor: selectedColor,
      aiCount: Math.min(aiCount, totalPlayers - 1),
      aiDifficulty: aiPersonality
    });
  };

  const handleQuickSinglePlayer = () => {
    onCreateGame({
      playersCount: 4,
      hostColor: selectedColor,
      aiCount: 3,
      aiDifficulty: 'balanced'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner with World Map Background */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-8 sm:p-12 shadow-2xl">
        {/* World Map Backdrop Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none scale-105"
          style={{ backgroundImage: `url(${heroMapBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>גרסה אסטרטגית עולמית מלאה</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            הקרב על השליטה העולמית מתחיל כאן
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            הצב תגבורות, תכנן מתקפות בזק, גלגל קוביות מלחמה ובצר את גבולותיך.
            שחק עם חברים ברשת או אתגר שחקני AI טקטיים עם סקירת AI מפורטת בסיום!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>משחק חדש (מארח)</span>
            </button>

            <button
              onClick={handleQuickSinglePlayer}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>קרב מהיר נגד AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Cards: Host Game vs Join Game */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: המארח - יוצר את המשחק */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">צעד 1: המארח (Host)</div>
              <h2 className="text-2xl font-black text-white">פתח משחק חדש והזמן חברים</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                צור חדר משחק ייעודי, קבע את מספר השחקנים ובחר את צבע הצבא שלך. קבל קוד חדר ייחודי שתוכל לשתף עם חבריך, והשלם את המקומות בשחקני AI.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>יצירת קוד חדר אוטומטי (לדוגמה: RISK-942)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>הוספת 0 עד 5 בוטים חכמים בדרגות קושי שונות</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>המתנה בלובי עד שכל השחקנים מוכנים והזנקת הקרב</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>הגדר וצור משחק חדש</span>
          </button>
        </div>

        {/* Card 2: האורח - מצטרף למשחק */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <LogIn className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">צעד 2: האורח (Guest)</div>
              <h2 className="text-2xl font-black text-white">הצטרף למשחק קיים</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                קיבלת קוד משחק מהמארח? הזן אותו כאן כדי להיכנס מיד לחדר, לבחור כינוי וצבע פנוי, ולהמתין יחד לפתיחת הקרב העולמי.
              </p>
            </div>

            {/* Join Code Input Form */}
            <form onSubmit={handleJoinSubmit} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300 text-right">
                הזן את קוד המשחק:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="למשל: RISK-4821"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all uppercase"
                />
              </div>

              {joinError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{joinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm shadow-md transition-transform active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isJoining ? 'מתחבר לחדר...' : 'הצטרף למשחק'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Player Profile & Military Rank Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20"
              style={{ backgroundColor: userProfile.preferredColor }}
            >
              {userProfile.nickname.slice(0, 2)}
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold">{userProfile.rankTitle}</div>
              <h3 className="text-lg font-black text-white">{userProfile.nickname}</h3>
              <p className="text-xs text-slate-400">
                {userProfile.gamesWon} ניצחונות מתוך {userProfile.gamesPlayed} קרבות
              </p>
            </div>
          </div>
          <button
            onClick={onOpenProfile}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="ערוך פרופיל"
          >
            ערוך
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">אחוז ניצחונות</div>
            <div className="text-2xl font-black text-white">
              {userProfile.gamesPlayed > 0 
                ? `${Math.round((userProfile.gamesWon / userProfile.gamesPlayed) * 100)}%`
                : '0%'}
            </div>
            <div className="text-xs text-slate-500">
              {userProfile.territoriesConquered} טריטוריות נכבשו
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">היסטוריית קרבות</div>
              <div className="text-xl font-black text-white">
                {gameHistory.length} משחקים שמורים
              </div>
              <div className="text-xs text-slate-500">כולל סקירות AI טקטיות</div>
            </div>
          </div>
          <button
            onClick={onOpenHistory}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            לכל המשחקים
          </button>
        </div>
      </div>

      {/* Recent Game Spotlight if any */}
      {gameHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">המשחק האחרון שנערך</h3>
            </div>
            <button
              onClick={() => onSelectGameForReview(gameHistory[0])}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
            >
              <span>צפה בסקירת AI מלאה</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">תאריך: {gameHistory[0].date}</div>
              <div className="text-sm font-black text-white mt-0.5">
                מנצח: <span style={{ color: gameHistory[0].winnerColor }}>{gameHistory[0].winnerName}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-300">
              <div>
                <span className="text-slate-500">תורות:</span> <span className="font-bold">{gameHistory[0].turns}</span>
              </div>
              <div>
                <span className="text-slate-500">קרבות:</span> <span className="font-bold">{gameHistory[0].totalBattles}</span>
              </div>
              <div>
                <span className="text-slate-500">משתתפים:</span> <span className="font-bold">{gameHistory[0].playersCount}</span>
              </div>
            </div>
            <button
              onClick={() => onSelectGameForReview(gameHistory[0])}
              className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>סקירת AI טקטית</span>
            </button>
          </div>
        </div>
      )}

      {/* Host Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">הגדרת משחק חדש (מארח)</h3>
                  <p className="text-xs text-slate-400">בחר שחקנים, צבע והגדרות לוחמה</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Total Players Slider / Selection */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>מספר שחקנים כולל במפה:</span>
                <span className="text-amber-400 font-black text-sm">{totalPlayers} שחקנים</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTotalPlayers(num);
                      if (aiCount >= num) setAiCount(num - 1);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      totalPlayers === num
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Bots count */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>שחקני AI (בוטים):</span>
                </span>
                <span className="text-purple-400 font-bold text-sm">
                  {aiCount} בוטים ({totalPlayers - aiCount} שחקנים אנושיים)
                </span>
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPlayers }, (_, idx) => idx).map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setAiCount(cnt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      aiCount === cnt
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {cnt === 0 ? 'ללא AI' : `${cnt} AI`}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Personality if AI count > 0 */}
            {aiCount > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">סגנון משחק של שחקני ה-AI:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'balanced', label: 'מאוזן וטקטי', desc: 'התקפה והגנה' },
                    { id: 'aggressive', label: 'אגרסיבי', desc: 'מתקפות בזק' },
                    { id: 'defensive', label: 'זהיר ומבוצר', desc: 'שמירה על גבולות' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAiPersonality(p.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        aiPersonality === p.id
                          ? 'bg-slate-800 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Host Color Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">בחר את צבע הצבא שלך:</label>
              <div className="grid grid-cols-6 gap-2">
                {PLAYER_COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                      selectedColor === color.hex
                        ? 'scale-110 shadow-lg border-white ring-2 ring-amber-400'
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleStartCreate}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer"
              >
                פתח חדר משחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
