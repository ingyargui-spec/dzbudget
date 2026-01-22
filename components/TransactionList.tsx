
import React from 'react';
import { Transaction, Category, Language } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ language, transactions, categories, onDelete }) => {
  const t = translations[language];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">{t.recentTransactions}</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{transactions.length}</span>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4 opacity-20">💸</div>
          <p className="text-slate-400 text-sm">{t.noTransactions}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {transactions.map(tx => {
            const category = categories.find(c => c.id === tx.categoryId);
            const isExpense = tx.type === 'EXPENSE';
            
            return (
              <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isExpense ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  {isExpense ? (category?.icon || '📦') : '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(tx.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-DZ')} • 
                    {tx.accountType === 'CASH' ? ` ${t.cash}` : ` ${t.salary}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {isExpense ? '-' : '+'}{tx.amount.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="text-[10px] text-slate-300 hover:text-rose-400 transition"
                  >
                    {t.cancel}
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
