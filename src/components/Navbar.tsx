import React from 'react';
import { Shield, BookOpen, User, History, Volume2, VolumeX, Home, Copy, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentScreen: 'home' | 'lobby' | 'game' | 'history';
  roomCode?: string;
  onNavigate: (screen: 'home' | 'lobby' | 'game' | 'history') => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  userNickname: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  roomCode,
  onNavigate,
  onOpenProfile,
  onOpenRules,
  onOpenHistory,
  userNickname
}) => {
  const [soundOn, setSoundOn] = React.useState(sound.isEnabled());
  const [copied, setCopied] = React.useState(false);

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundOn(newState);
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-right cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform border border-amber-400/30">
              <Shield className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                סיכון <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">RISK</span>
              </span>
              <p className="text-xs text-slate-400">אסטרטגיה וכיבוש עולמי</p>
            </div>
          </button>

          {/* Room Code Badge */}
          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs">
              <span className="text-slate-400">חדר:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider">{roomCode}</span>
              <button 
                onClick={copyRoomCode}
                title="העתק קוד חדר"
                className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentScreen !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="חזור למסך הראשי"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">ראשי</span>
            </button>
          )}

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="חוקי המשחק והוראות"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">חוקים</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="היסטוריית משחקים וסקירות AI"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">היסטוריה</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundOn ? 'השתק קולות' : 'הפעל קולות'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700/80 hover:from-slate-700 hover:to-slate-600 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="פרופיל שחקן"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-[10px] border border-amber-500/40">
              <User className="w-3 h-3" />
            </div>
            <span className="max-w-[100px] truncate">{userNickname}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
