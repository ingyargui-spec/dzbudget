
import React, { useState } from 'react';
import { Transaction, Category, AccountType, Language } from '../types';
import { translations } from '../translations';
import { X, Plus, Minus, CreditCard, Wallet, Landmark } from 'lucide-react';

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

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`bg-white/90 glass-card rounded-[3rem] p-10 w-full max-w-lg shadow-2xl ${isRtl ? 'rtl font-arabic text-right' : ''}`}>
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.addTransaction}</h2>
           <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
             <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Transaction Type Toggle */}
          <div className="bg-slate-100 p-2 rounded-3xl flex gap-2">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${type === 'EXPENSE' ? 'bg-white text-rose-500 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Minus size={14} /> {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${type === 'INCOME' ? 'bg-white text-emerald-500 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Plus size={14} /> {t.income}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2">{t.description}</label>
            <input
              type="text"
              required
              placeholder="Ex: Courses supermarché..."
              className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2">{t.amount}</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none text-right font-black text-2xl text-indigo-600"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">DA</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2">{t.account}</label>
              <div className="relative">
                <select
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-600 appearance-none transition-all"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="SALARY">{t.salary}</option>
                  <option value="SAVINGS">{t.savingsAccount}</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <CreditCard size={18} />
                </div>
              </div>
            </div>
          </div>

          {type === 'EXPENSE' && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-2">{t.category}</label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${categoryId === c.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-transparent bg-slate-50 grayscale hover:grayscale-0'}`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-[9px] font-black uppercase text-slate-600">{language === 'fr' ? c.nameFr : c.nameAr}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-6 bg-slate-900 text-white rounded-[1.8rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all text-lg tracking-tight"
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
