
import React from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  categories: Category[];
  onUpdateLimit: (id: string, limit: number) => void;
}

const Settings: React.FC<Props> = ({ language, categories, onUpdateLimit }) => {
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold mb-6 text-slate-800">{t.settings}</h3>
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-bold text-slate-700">{language === 'fr' ? cat.nameFr : cat.nameAr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={cat.limit}
                    onChange={(e) => onUpdateLimit(cat.id, parseFloat(e.target.value) || 0)}
                    className="w-24 p-1 text-right border-b-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-bold text-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t.currency}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between px-1">
                <span>0</span>
                <span>{t.setLimit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <p className="text-xs text-slate-400 italic">
          {language === 'fr' ? 'Vos données sont stockées localement sur votre appareil.' : 'بياناتك محفوظة محلياً على جهازك.'}
        </p>
      </div>
    </div>
  );
};

export default Settings;
