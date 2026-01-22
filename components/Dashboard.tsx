
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category, Language } from '../types';
import { translations } from '../translations';
import { getBudgetInsights } from '../services/gemini';

interface Props {
  language: Language;
  transactions: Transaction[];
  categories: Category[];
}

const Dashboard: React.FC<Props> = ({ language, transactions, categories }) => {
  const t = translations[language];
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = transactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + tx.amount, 0);
    
    const monthlyExpense = currentMonthTxs.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + tx.amount, 0);
    
    const cashBalance = transactions
      .filter(tx => tx.accountType === 'CASH')
      .reduce((acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0);

    const salaryBalance = transactions
      .filter(tx => tx.accountType === 'SALARY')
      .reduce((acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0);

    const categorySpending = categories.map(cat => {
      const spent = currentMonthTxs
        .filter(tx => tx.categoryId === cat.id && tx.type === 'EXPENSE')
        .reduce((acc, tx) => acc + tx.amount, 0);
      return {
        id: cat.id,
        name: language === 'fr' ? cat.nameFr : cat.nameAr,
        isEconomy: cat.nameFr.toLowerCase().includes('economie') || cat.nameFr.toLowerCase().includes('économie'),
        spent,
        limit: cat.limit,
        color: cat.color,
        percent: cat.limit > 0 ? (spent / cat.limit) * 100 : 0
      };
    });

    return {
      totalBalance: income - expense,
      monthlyExpense,
      cashBalance,
      salaryBalance,
      categorySpending
    };
  }, [transactions, categories, language]);

  const handleAiInsights = async () => {
    setLoadingAi(true);
    const insight = await getBudgetInsights(transactions, categories, language);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
          <p className="text-indigo-100 text-sm font-medium">{t.totalBalance}</p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.totalBalance.toLocaleString()} <span className="text-lg font-normal opacity-80">{t.currency}</span>
          </h2>
          <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-60">{t.cash}</p>
              <p className="font-semibold">{stats.cashBalance.toLocaleString()} {t.currency}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider opacity-60">{t.salary}</p>
              <p className="font-semibold">{stats.salaryBalance.toLocaleString()} {t.currency}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-medium">{t.monthlySpending}</p>
          <h2 className="text-3xl font-bold mt-1 text-rose-500">
            {stats.monthlyExpense.toLocaleString()} <span className="text-lg font-normal text-slate-400">{t.currency}</span>
          </h2>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-rose-500" 
               style={{ width: `${Math.min(100, (stats.monthlyExpense / (categories.reduce((a,b)=>a+b.limit,0) || 1)) * 100)}%` }}
             />
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-bold text-indigo-900">{t.insights}</h3>
          </div>
          <button 
            onClick={handleAiInsights}
            disabled={loadingAi}
            className="text-xs font-bold text-indigo-600 underline disabled:opacity-50"
          >
            {loadingAi ? t.loading : t.getInsights}
          </button>
        </div>
        {aiInsight && (
          <div className="text-sm text-indigo-800 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-top-2">
            {aiInsight}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-6 text-slate-800">{t.spendingByCategory}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categorySpending.filter(c => c.spent > 0)}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={55}
                  paddingAngle={5}
                >
                  {stats.categorySpending.filter(c => c.spent > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} ${t.currency}`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-6 text-slate-800">{t.budgetVsActual}</h3>
          <div className="space-y-4">
            {stats.categorySpending.map(cat => (
              <div key={cat.id}>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    {cat.isEconomy && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1 rounded font-bold uppercase">{t.savingsGoal}</span>}
                  </div>
                  <span className={`${cat.isEconomy ? (cat.percent >= 100 ? 'text-emerald-600 font-bold' : 'text-slate-400') : (cat.percent > 100 ? 'text-rose-500 font-bold' : 'text-slate-400')}`}>
                    {cat.spent.toLocaleString()} / {cat.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(100, cat.percent)}%`,
                      backgroundColor: cat.isEconomy ? (cat.percent >= 100 ? '#10B981' : cat.color) : (cat.percent > 100 ? '#EF4444' : cat.color)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
