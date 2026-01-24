
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis } from 'recharts';
import { Transaction, Category, Language } from '../types';
import { translations } from '../translations';
import { getBudgetInsights } from '../services/gemini';
import { TrendingUp, Wallet, Landmark, PiggyBank, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  language: Language;
  transactions: Transaction[];
  categories: Category[];
  savingsGoal: number;
}

const Dashboard: React.FC<Props> = ({ language, transactions, categories, savingsGoal }) => {
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

    const savingsBalance = transactions
      .filter(tx => tx.accountType === 'SAVINGS')
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

    return { totalBalance: income - expense, monthlyExpense, cashBalance, salaryBalance, savingsBalance, categorySpending };
  }, [transactions, categories, language]);

  const handleAiInsights = async () => {
    setLoadingAi(true);
    const insight = await getBudgetInsights(transactions, categories, language);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const savingsPercent = savingsGoal > 0 ? (stats.savingsBalance / savingsGoal) * 100 : 0;
  const isRtl = language === 'ar';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 mesh-bg rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-[0.2em] mb-1">{t.totalBalance}</p>
                <h2 className="text-5xl font-extrabold tracking-tight flex items-baseline gap-2">
                  {stats.totalBalance.toLocaleString()}
                  <span className="text-xl font-medium opacity-50">{t.currency}</span>
                </h2>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/5 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <Wallet size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.cash}</span>
                </div>
                <p className="font-bold text-lg leading-none">{stats.cashBalance.toLocaleString()} <span className="text-[10px] opacity-40">DA</span></p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/5 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <Landmark size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.salary}</span>
                </div>
                <p className="font-bold text-lg leading-none">{stats.salaryBalance.toLocaleString()} <span className="text-[10px] opacity-40">DA</span></p>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-lg rounded-3xl p-4 border border-emerald-500/20 hover:bg-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-emerald-300">
                  <PiggyBank size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">ÉPARGNE</span>
                </div>
                <p className="font-bold text-lg leading-none text-emerald-50">{stats.savingsBalance.toLocaleString()} <span className="text-[10px] opacity-40">DA</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col justify-between group">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sparkles size={20} />
              </span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${savingsPercent >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {savingsPercent >= 100 ? t.goalReached : t.savingsGoal}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t.savingsProgress}</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">
              {stats.savingsBalance.toLocaleString()}
              <span className="text-lg text-slate-300 ml-1">DA</span>
            </h3>
            <p className="text-sm text-slate-400">Objectif: <span className="font-bold text-slate-600">{savingsGoal.toLocaleString()}</span></p>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2">
              <span>PROGRESSION</span>
              <span className={savingsPercent >= 100 ? 'text-emerald-500' : 'text-indigo-500'}>{Math.round(savingsPercent)}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${savingsPercent >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`} 
                style={{ width: `${Math.min(100, savingsPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* IA Insights Section */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-xl">{t.insights}</h3>
              <p className="text-xs text-slate-400 font-medium">Analyse temps réel par Gemini AI</p>
            </div>
          </div>
          <button 
            onClick={handleAiInsights}
            disabled={loadingAi}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${loadingAi ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 active:scale-95'}`}
          >
            {loadingAi ? t.loading : t.getInsights}
          </button>
        </div>
        {aiInsight && (
          <div className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 rounded-3xl p-6 leading-relaxed animate-in slide-in-from-top-2 duration-500">
            {aiInsight}
          </div>
        )}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-3">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               {t.spendingByCategory}
            </h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categorySpending.filter(c => c.spent > 0)}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={75}
                  paddingAngle={8}
                  stroke="none"
                >
                  {stats.categorySpending.filter(c => c.spent > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px 24px' }}
                  itemStyle={{ fontWeight: '800', color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual Bars */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h3 className="font-extrabold text-slate-800 text-lg mb-8 flex items-center gap-3">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             {t.budgetVsActual}
          </h3>
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.categorySpending.map(cat => (
              <div key={cat.id} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">
                      {cat.id === '1' ? '🍎' : cat.id === '2' ? '🏠' : cat.id === '3' ? '🚗' : cat.id === '7' ? '💰' : '📦'}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black ${cat.percent > 100 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {cat.spent.toLocaleString()} / {cat.limit.toLocaleString()} DA
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min(100, cat.percent)}%`,
                      backgroundColor: cat.percent > 100 ? '#f43f5e' : cat.color
                    }}
                  />
                </div>
                {cat.percent > 100 && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                    <AlertCircle size={10} /> Dépassement détecté
                  </div>
                )}
                {cat.isEconomy && cat.percent >= 100 && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
                    <CheckCircle2 size={10} /> Objectif épargne atteint !
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
