
import React from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  categories: Category[];
  onUpdateLimit: (id: string, limit: number) => void;
  savingsGoal: number;
  onUpdateSavingsGoal: (goal: number) => void;
}

const Settings: React.FC<Props> = ({ language, categories, onUpdateLimit, savingsGoal, onUpdateSavingsGoal }) => {
  const t = translations[language];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Savings Account Goal Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <span className="text-6xl text-emerald-500">💰</span>
        </div>
        <h3 className="font-black mb-6 text-slate-800 text-lg flex items-center gap-2">
           <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
           {t.savingsAccount}
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">{t.setSavingsGoal}</label>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => onUpdateSavingsGoal(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent border-none outline-none text-2xl font-black text-emerald-600 text-right"
              />
              <span className="text-lg font-bold text-slate-400">{t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Limits Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <h3 className="font-black mb-8 text-slate-800 text-lg flex items-center gap-2">
           <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
           {t.settings}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map(cat => (
            <div key={cat.id} className="group p-4 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-brand-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-slate-700">{language === 'fr' ? cat.nameFr : cat.nameAr}</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl">
                  <span className="text-[9px] font-black text-slate-300 uppercase">{t.setLimit}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={cat.limit}
                      onChange={(e) => onUpdateLimit(cat.id, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-right outline-none text-sm font-black text-brand-600"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{t.currency}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-[1.5rem] p-6 text-center shadow-inner">
        <p className="text-[11px] text-slate-400 font-medium tracking-wide leading-relaxed">
          {language === 'fr' 
            ? 'DzBudget protège votre vie privée. Toutes vos transactions sont stockées uniquement en local sur votre appareil.' 
            : 'تطبيق DzBudget يحمي خصوصيتك. جميع معاملاتك مخزنة فقط محلياً على جهازك.'}
        </p>
      </div>
    </div>
  );
};

export default Settings;
