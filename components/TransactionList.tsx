
import React from 'react';
import { Transaction, Category, Language } from '../types';
import { translations } from '../translations';
/* Added Landmark to imports */
import { Trash2, ShoppingBag, Home, Bus, HeartPulse, Gamepad2, PiggyBank, Package, Landmark } from 'lucide-react';

interface Props {
  language: Language;
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ language, transactions, categories, onDelete }) => {
  const t = translations[language];

  const getIcon = (catId: string) => {
    switch(catId) {
      case '1': return <ShoppingBag className="w-5 h-5" />;
      case '2': return <Home className="w-5 h-5" />;
      case '3': return <Bus className="w-5 h-5" />;
      case '4': return <HeartPulse className="w-5 h-5" />;
      case '5': return <Gamepad2 className="w-5 h-5" />;
      case '7': return <PiggyBank className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-slate-800 text-xl">{t.recentTransactions}</h3>
          <p className="text-xs text-slate-400 font-medium">Historique complet de vos activités</p>
        </div>
        <div className="px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black text-slate-500 tracking-wider">
          {transactions.length} ITEMS
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <ShoppingBag size={40} />
          </div>
          <p className="text-slate-400 font-bold">{t.noTransactions}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
          {transactions.map((tx, idx) => {
            const category = categories.find(c => c.id === tx.categoryId);
            const isExpense = tx.type === 'EXPENSE';
            
            return (
              <div 
                key={tx.id} 
                className="p-6 flex items-center gap-6 hover:bg-slate-50/80 transition-all group animate-in slide-in-from-right duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {isExpense ? getIcon(tx.categoryId) : <Landmark className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-800 truncate text-lg tracking-tight">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {tx.accountType === 'CASH' ? t.cash : tx.accountType === 'SALARY' ? t.salary : t.savingsAccount}
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(tx.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-DZ')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className={`font-black text-xl tracking-tighter ${isExpense ? 'text-slate-900' : 'text-emerald-500'}`}>
                      {isExpense ? '-' : '+'}{tx.amount.toLocaleString()}
                      <span className="text-[10px] ml-1 opacity-40">DA</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
