
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category, Language } from '../types';
import { translations } from '../translations';
import { getBudgetInsights } from '../services/gemini';
import { TrendingUp, Wallet, Landmark, PiggyBank, Sparkles, AlertCircle, CheckCircle2, Heart } from 'lucide-react';

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
    const monthlyIncome = currentMonthTxs.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0);
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
        spent,
        limit: cat.limit,
        color: cat.color,
        percent: cat.limit > 0 ? (spent / cat.limit) * 100 : 0,
        isEconomy: cat.nameFr.toLowerCase().includes('economie') || cat.nameFr.toLowerCase().includes('économie'),
      };
    });

    // Score de santé financière (0-100)
    let healthScore = 100;
    if (monthlyIncome > 0) {
      const ratio = monthlyExpense / monthlyIncome;
      healthScore = Math.max(0, Math.min(100, 100 - (ratio * 100)));
    } else if (monthlyExpense > 0) {
      healthScore = 0;
    }

    return { 
      totalBalance: income - expense, 
      monthlyIncome,
      monthlyExpense, 
      cashBalance, 
      salaryBalance, 
      savingsBalance, 
      categorySpending,
      healthScore
    };
  }, [transactions, categories, language]);

  const handleAiInsights = async () => {
    setLoadingAi(true);
    const insight = await getBudgetInsights(transactions, categories, language);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const savingsPercent = savingsGoal > 0 ? (stats.savingsBalance / savingsGoal) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card with Balance & Health Score */}
        <div className="lg:col-span-2 mesh-bg rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{t.totalBalance}</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-6xl font-black tracking-tightest">
                    {stats.totalBalance.toLocaleString()}
                  </h2>
                  <span className="text-2xl font-medium opacity-40">{t.currency}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${stats.healthScore > 50 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span className="text-xs font-black uppercase tracking-widest">Santé: {Math.round(stats.healthScore)}%</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 opacity-60">
                  <Wallet size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.cash}</span>
                </div>
                <p className="font-extrabold text-xl">{stats.cashBalance.toLocaleString()} <span className="text-xs opacity-40">DA</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 opacity-60">
                  <Landmark size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.salary}</span>
                </div>
                <p className="font-extrabold text-xl">{stats.salaryBalance.toLocaleString()} <span className="text-xs opacity-40">DA</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300">
                  <PiggyBank size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">EPARGNE</span>
                </div>
                <p className="font-extrabold text-xl text-emerald-50">{stats.savingsBalance.toLocaleString()} <span className="text-xs opacity-40">DA</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goal Premium Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute bottom-0 right-0 opacity-[0.03] -mr-10 -mb-10">
            <PiggyBank size={200} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-10">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Sparkles size={24} />
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${savingsPercent >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {savingsPercent >= 100 ? 'Succès' : 'En cours'}
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.savingsProgress}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tightest">
              {stats.savingsBalance.toLocaleString()}
              <span className="text-lg text-slate-300 ml-2 font-bold">DA</span>
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium">Cible: <span className="font-bold text-slate-900">{savingsGoal.toLocaleString()} DA</span></p>
          </div>
          
          <div className="mt-12 relative">
            <div className="flex justify-between text-[11px] font-black text-slate-800 mb-3">
              <span>{Math.round(savingsPercent)}% COMPLÉTÉ</span>
              <span className="text-indigo-600">{((savingsGoal - stats.savingsBalance) > 0 ? (savingsGoal - stats.savingsBalance) : 0).toLocaleString()} DA RESTANT</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${savingsPercent >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-violet-600'}`} 
                style={{ width: `${Math.min(100, savingsPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* IA Smart Advice Card */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/40 group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-2xl tracking-tight">{t.insights}</h3>
              <p className="text-sm text-slate-400 font-medium">L'intelligence artificielle analyse vos habitudes en DZD.</p>
            </div>
          </div>
          <button 
            onClick={handleAiInsights}
            disabled={loadingAi}
            className={`px-10 py-5 rounded-[1.5rem] text-xs font-black tracking-widest transition-all ${loadingAi ? 'bg-slate-100 text-slate-400 animate-pulse' : 'bg-indigo-600 text-white hover:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 active:scale-95'}`}
          >
            {loadingAi ? t.loading : t.getInsights}
          </button>
        </div>
        {aiInsight && (
          <div className="mt-10 text-base text-slate-700 bg-white border border-slate-100 rounded-[2rem] p-8 leading-relaxed animate-in zoom-in-95 duration-500 shadow-sm font-medium">
            {aiInsight}
          </div>
        )}
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Circle */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
             <h3 className="font-black text-slate-900 text-xl tracking-tight">{t.spendingByCategory}</h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categorySpending.filter(c => c.spent > 0)}
                  dataKey="spent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={85}
                  paddingAngle={10}
                  stroke="none"
                >
                  {stats.categorySpending.filter(c => c.spent > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px 24px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Detailed Progress */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
             <h3 className="font-black text-slate-900 text-xl tracking-tight">{t.budgetVsActual}</h3>
          </div>
          <div className="space-y-8 overflow-y-auto max-h-[320px] pr-4 custom-scrollbar">
            {stats.categorySpending.map(cat => (
              <div key={cat.id} className="group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300 inline-block">{categories.find(c => c.id === cat.id)?.icon}</span>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{cat.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {Math.round(cat.percent)}% du budget utilisé
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black tracking-tight ${cat.percent > 100 ? 'text-rose-500' : 'text-slate-900'}`}>
                      {cat.spent.toLocaleString()} DA
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Limite: {cat.limit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ 
                      width: `${Math.min(100, cat.percent)}%`,
                      backgroundColor: cat.percent > 100 ? '#f43f5e' : cat.color
                    }}
                  />
                </div>
                {cat.percent > 100 && (
                  <p className="text-[9px] text-rose-500 font-black mt-2 flex items-center gap-1 uppercase tracking-widest">
                    <AlertCircle size={10} /> Dépassement critique
                  </p>
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
