import React from 'react';
import { Shield, BookOpen, User, History, Volume2, VolumeX, Home, Copy, Check, LogIn, LogOut } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentScreen: 'landing' | 'home' | 'lobby' | 'game' | 'history';
  roomCode?: string;
  onNavigate: (screen: 'landing' | 'home' | 'lobby' | 'game' | 'history') => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenAuth: () => void;
  userNickname: string;
  userEmail?: string;
  onLogout?: () => void;
  onQuitGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  roomCode,
  onNavigate,
  onOpenProfile,
  onOpenRules,
  onOpenHistory,
  onOpenAuth,
  userNickname,
  userEmail,
  onLogout,
  onQuitGame
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
    <header className="bg-[#15233a]/95 border-b border-[#273e63] backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-right cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1c2e4a] border border-[#2e4c7a] flex items-center justify-center text-sky-400 shadow-inner group-hover:border-blue-400 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white font-cinzel">
                  סיכון · RISK
                </span>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  STRATEGIC
                </span>
              </div>
              <p className="text-[11px] text-slate-300">המערכה לשליטה עולמית</p>
            </div>
          </button>

          {/* Room Code Badge */}
          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#141b26] rounded-lg border border-[#2b3a4f] text-xs">
              <span className="text-slate-400">חדר:</span>
              <span className="font-mono font-bold text-[#c5a059] tracking-wider">{roomCode}</span>
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          {currentScreen === 'game' && onQuitGame ? (
            <button
              onClick={onQuitGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#dc2626]/20 hover:bg-[#dc2626] text-red-200 hover:text-white border border-[#dc2626]/40 transition-colors cursor-pointer"
              title="פרוש מהקרב וחזור לראשי"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>פרוש מהקרב</span>
            </button>
          ) : (
            currentScreen !== 'home' && (
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1a2332] transition-colors cursor-pointer"
                title="חזור למסך הראשי"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">ראשי</span>
              </button>
            )
          )}

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1a2332] transition-colors cursor-pointer"
            title="חוקי המשחק והוראות"
          >
            <BookOpen className="w-4 h-4 text-[#c5a059]" />
            <span className="hidden sm:inline">חוקים</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1a2332] transition-colors cursor-pointer"
            title="היסטוריית קרבות ותחקירים"
          >
            <History className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">יומן</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              soundOn 
                ? 'border-[#2d3d52] bg-[#141b26] text-amber-300 hover:bg-[#1c2738]' 
                : 'border-[#2d3d52] bg-[#141b26] text-slate-500 hover:bg-[#1c2738]'
            }`}
            title={soundOn ? 'השתק צלילים' : 'הפעל צלילים'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Profile / Auth Button */}
          {userEmail ? (
            <div className="flex items-center gap-1.5 bg-[#141b26] border border-[#2b3a4f] rounded-lg px-2.5 py-1">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="max-w-[100px] truncate">{userNickname}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer mr-1"
                  title="התנתק"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs shadow transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>כניסה / הרשמה</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
