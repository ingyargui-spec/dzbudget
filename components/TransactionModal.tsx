
import React, { useState } from 'react';
import { Transaction, Category, AccountType, Language } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  categories: Category[];
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionModal: React.FC<Props> = ({ language, categories, onClose, onSave }) => {
  const t = translations[language];
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [accountType, setAccountType] = useState<AccountType>('CASH');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSave({
      date: new Date().toISOString(),
      description,
      amount: parseFloat(amount),
      categoryId,
      accountType,
      type
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 ${language === 'ar' ? 'rtl font-arabic' : ''}`}>
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black text-slate-800">{t.addTransaction}</h2>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.income}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">{t.description}</label>
            <input
              type="text"
              required
              placeholder="..."
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">{t.amount}</label>
              <input
                type="number"
                required
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-right font-black text-brand-600"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">{t.account}</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-600 appearance-none"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
              >
                <option value="CASH">{t.cash}</option>
                <option value="SALARY">{t.salary}</option>
              </select>
            </div>
          </div>

          {type === 'EXPENSE' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">{t.category}</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-600 appearance-none"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {language === 'fr' ? c.nameFr : c.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-100 hover:bg-brand-700 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
