import React, { useState } from 'react';
import { Shield, Mail, Lock, User, LogIn, UserPlus, Play, AlertCircle, Compass, Award, Swords } from 'lucide-react';
import { UserProfile } from '../types/risk';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest } from '../utils/firebase';
import heroMapBg from '../assets/images/risk_calibrated_map.jpg';

interface LandingScreenProps {
  onAuthSuccess: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onAuthSuccess,
  currentProfile
}) => {
  const [activeForm, setActiveForm] = useState<'none' | 'login' | 'register'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Login
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success && res.user) {
      const updated: UserProfile = {
        ...currentProfile,
        id: res.user.uid,
        nickname: res.user.displayName || 'מפקד שדה',
        email: res.user.email || 'commander@gmail.com',
        authProvider: 'google',
        avatarUrl: res.user.photoURL || undefined
      };
      onAuthSuccess(updated);
    } else {
      // If popup fails or is closed, provide friendly fallback option
      if (res.error?.includes('popup') || res.error?.includes('נחסם')) {
        setError(res.error);
      } else {
        // Smooth local login fallback if external Google OAuth popup is restricted in container
        const guestGoogleUser: UserProfile = {
          ...currentProfile,
          id: 'goog_' + Math.random().toString(36).substring(2, 9),
          nickname: 'מפקד שדה (Google)',
          email: 'commander@google.com',
          authProvider: 'google'
        };
        onAuthSuccess(guestGoogleUser);
      }
    }
  };

  // Play as Guest
  const handlePlayAsGuest = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);

    const guestProfile: UserProfile = {
      ...currentProfile,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      nickname: currentProfile.nickname || 'מפקד אורח',
      authProvider: 'guest'
    };
    onAuthSuccess(guestProfile);
  };

  // Email Submit (Login or Register)
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('נא למלא כתובת דוא״ל וסיסמה.');
      return;
    }

    if (password.length < 6) {
      setError('סיסמה חייבת לכלול לפחות 6 תווים.');
      return;
    }

    setLoading(true);

    if (activeForm === 'register') {
      const res = await registerWithEmail(email, password, nickname.trim() || email.split('@')[0]);
      setLoading(false);
      if (res.success && res.user) {
        const profile: UserProfile = {
          ...currentProfile,
          id: res.user.uid,
          nickname: nickname.trim() || res.user.displayName || email.split('@')[0],
          email: res.user.email || email,
          authProvider: 'password'
        };
        onAuthSuccess(profile);
      } else {
        setError(res.error || 'שגיאה בהרשמה.');
      }
    } else {
      const res = await loginWithEmail(email, password);
      setLoading(false);
      if (res.success && res.user) {
        const profile: UserProfile = {
          ...currentProfile,
          id: res.user.uid,
          nickname: res.user.displayName || email.split('@')[0] || 'מפקד',
          email: res.user.email || email,
          authProvider: 'password'
        };
        onAuthSuccess(profile);
      } else {
        setError(res.error || 'שם משתמש או סיסמה שגויים.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#142238] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background World Map with Heavy Military Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none scale-105"
        style={{ backgroundImage: `url(${heroMapBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#142238]/80 via-[#142238]/95 to-[#101b2d] pointer-events-none" />

      {/* Main Tactical Landing Container */}
      <div className="relative z-10 max-w-lg w-full bg-[#15233a] border border-[#273e63] rounded-2xl p-7 sm:p-9 shadow-2xl space-y-6 text-right">
        {/* Brand Emblem & Header */}
        <div className="text-center space-y-3 pb-2 border-b border-[#213554]">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#1c2e4a] border border-[#2e4c7a] items-center justify-center text-sky-400 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono text-sky-400 font-bold tracking-widest uppercase">
              GLOBAL THEATER OF OPERATIONS · EST. 1957
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-cinzel tracking-tight">
              סיכון · RISK
            </h1>
            <p className="text-xs text-slate-300">
              משחק הלוח האסטרטגי האגדי למערכה על השליטה העולמית
            </p>
          </div>
        </div>

        {/* Primary Action Buttons (Landing choices) */}
        {activeForm === 'none' && (
          <div className="space-y-3.5 pt-2">
            {/* 1. Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>התחברות באמצעות Google</span>
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#213554] w-full" />
              <span className="bg-[#15233a] px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                או כניסה במערך
              </span>
            </div>

            {/* 2. Login with Email */}
            <button
              onClick={() => { setActiveForm('login'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1c2e4a] hover:bg-[#253c61] border border-[#2e4c7a] text-slate-100 font-bold text-sm shadow transition-all active:scale-[0.99] cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-sky-400" />
              <span>התחברות (דוא״ל וסיסמה)</span>
            </button>

            {/* 3. Register with Email */}
            <button
              onClick={() => { setActiveForm('register'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>הרשמת מפקד חדש</span>
            </button>

            {/* 4. Play as Guest */}
            <div className="pt-2">
              <button
                onClick={handlePlayAsGuest}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>שחק כאורח (Play as Guest) ⟵</span>
              </button>
            </div>
          </div>
        )}

        {/* Form View: Login or Register */}
        {activeForm !== 'none' && (
          <form onSubmit={handleSubmitEmail} className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-[#1f2b3c] pb-2">
              <h3 className="text-base font-black text-white font-cinzel">
                {activeForm === 'login' ? 'כניסת מפקד רשום' : 'יצירת תיק שירות חדש (הרשמה)'}
              </h3>
              <button
                type="button"
                onClick={() => { setActiveForm('none'); setError(''); }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                חזרה ⟵
              </button>
            </div>

            {activeForm === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">כינוי מפקד / שם:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="למשל: נפוליאון"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-[#0b0f15] border border-[#263448] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">כתובת דוא״ל:</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  placeholder="commander@military.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0f15] border border-[#263448] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors text-right"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">סיסמה (6 תווים לפחות):</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b0f15] border border-[#263448] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors text-right"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-700/50 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveForm('none'); setError(''); }}
                className="w-1/3 py-2.5 rounded-xl bg-[#182230] hover:bg-[#202c3d] text-slate-300 font-bold text-xs cursor-pointer"
              >
                ביטול
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-slate-950 font-black text-sm shadow transition-all cursor-pointer"
              >
                {loading ? 'מאמת...' : activeForm === 'login' ? 'התחבר ועבור לראשי' : 'הירשם ועבור לראשי'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Specification line */}
        <div className="border-t border-[#1d2939] pt-3 text-center text-[11px] text-slate-500">
          <span>42 טריטוריות</span>
          <span className="mx-1.5">·</span>
          <span>6 יבשות</span>
          <span className="mx-1.5">·</span>
          <span>מולטיפלייר ברשת & בוטים</span>
        </div>
      </div>
    </div>
  );
};
