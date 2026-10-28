import React from 'react';
import { BookOpen, Shield, Swords, ShieldCheck, Trophy, Dices } from 'lucide-react';
import { CONTINENTS } from '../data/riskMapData';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-right max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">חוקי משחק סיכון (Risk)</h3>
              <p className="text-xs text-slate-400">מדריך טקטי מקיף לניהול מערכה עולמית</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Rules Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm leading-relaxed text-slate-300">
          {/* Section 1: Goal */}
          <div className="space-y-2">
            <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>מטרת המשחק</span>
            </h4>
            <p>
              לכבוש את כל 42 הטריטוריות ברחבי הגלובוס ולהדיח את כל השחקנים היריבים.
            </p>
          </div>

          {/* Section 2: Phase 1 - Reinforcement */}
          <div className="space-y-2">
            <h4 className="text-base font-black text-blue-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>שלב 1: הצבת תגבורות (Reinforcements)</span>
            </h4>
            <p>
              בתחילת כל תור מקבל השחקן חיילי תגבורת לפי החישוב הבא:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pr-2">
              <li><b>טריטוריות:</b> מספר הטריטוריות שבשליטתך חלקי 3 (מעוגל כלפי מטה, מינימום 3 חיילים).</li>
              <li><b>בונוסי יבשות:</b> שליטה מלאה בכל הטריטוריות של יבשת מעניקה בונוס קבוע בכל תור:</li>
            </ul>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              {Object.values(CONTINENTS).map(c => (
                <div key={c.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                  <span>{c.nameHebrew}:</span>
                  <span className="font-bold text-amber-400">+{c.bonus} חיילים</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Phase 2 - Attack */}
          <div className="space-y-2">
            <h4 className="text-base font-black text-red-400 flex items-center gap-2">
              <Swords className="w-4 h-4" />
              <span>שלב 2: התקפה (Attack)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pr-2">
              <li>התקפה מותרת רק מטריטוריה שבה יש <b>לפחות 2 חיילים</b> לעבר טריטוריה עוינת סמוכה.</li>
              <li><b>קוביות תוקף:</b> 1 עד 3 קוביות (מקסימום כמות החיילים בתוקף פחות 1).</li>
              <li><b>קוביות מגן:</b> 1 או 2 קוביות (מקסימום כמות החיילים במגן).</li>
              <li><b>השוואת קוביות:</b> משווים את הקובייה הגבוהה של התוקף מול הגבוהה של המגן. במקרה של שוויון – <b>המגן תמיד מנצח!</b></li>
              <li>אם שני השחקנים הטילו 2 קוביות ומעלה, משווים גם את הקוביות השניות.</li>
              <li><b>כיבוש טריטוריה:</b> כאשר כוחות המגן מושמדים (0 חיילים), הטריטוריה נכבשת! התוקף מעביר אליה לפחות את מספר הקוביות שהטיל, ומשאיר לפחות חייל אחד מאחור.</li>
            </ul>
          </div>

          {/* Section 4: Phase 3 - Fortify */}
          <div className="space-y-2">
            <h4 className="text-base font-black text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>שלב 3: ביצור (Fortify)</span>
            </h4>
            <p className="text-xs">
              בסיום שלב ההתקפה, רשאי השחקן לבצע <b>תנועת ביצור אחת אופציונלית</b>: להעביר כל מספר של חיילים מטריטוריה אחת שלו לטריטוריה אחרת שלו, ובלבד שקיים ביניהן רצף טריטוריאלי רציף שבשליטתו. חייב להישאר לפחות חייל 1 בטריטוריית המקור.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
          >
            הבנתי, סגור חוקים
          </button>
        </div>
      </div>
    </div>
  );
};
