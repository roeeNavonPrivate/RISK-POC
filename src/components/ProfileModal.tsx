import React, { useState } from 'react';
import { User, Award, Shield, History, Trophy, Swords, Check } from 'lucide-react';
import { UserProfile } from '../types/risk';
import { PLAYER_COLORS } from '../data/riskMapData';

interface ProfileModalProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onOpenHistory: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSaveProfile,
  onOpenHistory,
  onClose
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [color, setColor] = useState(profile.preferredColor);
  const [savedNotice, setSavedNotice] = useState(false);

  const winRate = profile.gamesPlayed > 0 
    ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) 
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      nickname: nickname.trim() || 'מפקד שדה',
      preferredColor: color
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1624]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#15233a] border border-[#273e63] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213554] pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20"
              style={{ backgroundColor: color }}
            >
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">פרופיל מפקד</h3>
              <p className="text-xs text-sky-400 font-bold">{profile.rankTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              כינוי קרבי:
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full bg-[#121c2e] border border-[#273e63] focus:border-blue-500 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              צבע צבא מועדף:
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {PLAYER_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                    color === c.hex 
                      ? 'scale-110 border-white ring-2 ring-blue-400 shadow-md' 
                      : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {color === c.hex && <span className="w-2 h-2 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          {savedNotice && (
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
              <Check className="w-4 h-4" />
              <span>הפרופיל נשמר בהצלחה!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            שמור שינויים בפרופיל
          </button>
        </form>

        {/* Career Stats Grid */}
        <div className="p-4 rounded-2xl bg-[#121c2e] border border-[#233550] space-y-3">
          <div className="text-xs font-bold text-slate-400">מאזן קריירה צבאית:</div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[#182842] border border-[#273e63]">
              <div className="text-xs text-slate-400">קרבות נערכו</div>
              <div className="text-xl font-black text-white">{profile.gamesPlayed}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#182842] border border-[#273e63]">
              <div className="text-xs text-slate-400">ניצחונות</div>
              <div className="text-xl font-black text-sky-400">{profile.gamesWon} ({winRate}%)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#182842] border border-[#273e63]">
              <div className="text-xs text-slate-400">טריטוריות שנכבשו</div>
              <div className="text-xl font-black text-blue-400">{profile.territoriesConquered}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#182842] border border-[#273e63]">
              <div className="text-xs text-slate-400">צבאות יריב שהושמדו</div>
              <div className="text-xl font-black text-red-400">{profile.armiesDefeated}</div>
            </div>
          </div>
        </div>

        {/* View History CTA */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenHistory();
          }}
          className="w-full py-3 rounded-xl bg-[#182842] hover:bg-[#1e3456] text-sky-400 border border-[#273e63] font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span>מעבר להיסטוריית המשחקים וסקירות AI</span>
        </button>
      </div>
    </div>
  );
};
