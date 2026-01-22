
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Balance Cards - Mesh Gradient Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mesh-gradient rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-indigo-100/80 text-sm font-medium uppercase tracking-widest">{t.totalBalance}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-4xl font-extrabold tracking-tight">
              {stats.totalBalance.toLocaleString()}
            </h2>
            <span className="text-xl font-medium opacity-70">{t.currency}</span>
          </div>
          
          <div className="mt-8 flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{t.cash}</p>
              <p className="font-bold text-lg">{stats.cashBalance.toLocaleString()} <span className="text-xs opacity-60">{t.currency}</span></p>
            </div>
            <div className="w-[1px] h-8 bg-white/20"></div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{t.salary}</p>
              <p className="font-bold text-lg">{stats.salaryBalance.toLocaleString()} <span className="text-xs opacity-60">{t.currency}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{t.monthlySpending}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-4xl font-extrabold text-slate-900 group-hover:text-rose-500 transition-colors">
                {stats.monthlyExpense.toLocaleString()}
              </h2>
              <span className="text-xl font-medium text-slate-400">{t.currency}</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-400">
              <span>PROGRESSION</span>
              <span>{Math.round((stats.monthlyExpense / (categories.reduce((a,b)=>a+b.limit,0) || 1)) * 100)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${Math.min(100, (stats.monthlyExpense / (categories.reduce((a,b)=>a+b.limit,0) || 1)) * 100)}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Card */}
      <div className="relative overflow-hidden bg-white border border-indigo-50 rounded-3xl p-6 shadow-lg shadow-indigo-100/20">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <span className="text-lg">✨</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{t.insights}</h3>
          </div>
          <button 
            onClick={handleAiInsights}
            disabled={loadingAi}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${loadingAi ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100'}`}
          >
            {loadingAi ? t.loading : t.getInsights}
          </button>
        </div>
        {aiInsight && (
          <div className="text-sm text-slate-600 bg-slate-50/50 rounded-2xl p-4 leading-relaxed animate-in zoom-in-95 duration-300">
            {aiInsight}
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="font-bold mb-8 text-slate-800 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
             {t.spendingByCategory}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categorySpending.filter(c => c.spent > 0)}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={70}
                  paddingAngle={8}
                  stroke="none"
                >
                  {stats.categorySpending.filter(c => c.spent > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '12px 20px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()} ${t.currency}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {stats.categorySpending.filter(c => c.spent > 0).slice(0, 4).map(c => (
               <div key={c.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="text-[10px] font-bold text-slate-500 truncate">{c.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="font-bold mb-8 text-slate-800 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
             {t.budgetVsActual}
          </h3>
          <div className="space-y-6">
            {stats.categorySpending.map(cat => (
              <div key={cat.id} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                      {cat.isEconomy && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${cat.percent >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {cat.percent >= 100 ? t.goalReached : t.savingsGoal}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black ${cat.isEconomy ? (cat.percent >= 100 ? 'text-emerald-500' : 'text-slate-400') : (cat.percent > 100 ? 'text-rose-500' : 'text-slate-400')}`}>
                      {cat.spent.toLocaleString()} / {cat.limit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
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
