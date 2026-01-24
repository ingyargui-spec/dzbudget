
import React, { useState, useEffect } from 'react';
import { Transaction, Category, Language } from './types';
import { INITIAL_CATEGORIES } from './constants';
import { translations } from './translations';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';
import { LayoutDashboard, ReceiptText, Settings as SettingsIcon, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('dz_budget_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dz_budget_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('dz_budget_savings_goal');
    return saved ? parseFloat(saved) : 100000;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dz_budget_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dz_budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dz_budget_savings_goal', savingsGoal.toString());
  }, [savingsGoal]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = { ...newTx, id: crypto.randomUUID() };
    setTransactions([transaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateCategoryLimit = (id: string, limit: number) => {
    setCategories(categories.map(c => c.id === id ? { ...c, limit } : c));
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  return (
    <div className={`min-h-screen bg-slate-50 pb-32 ${isRtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="text-white w-5 h-5 rotate-45" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">
              Dz<span className="text-indigo-600">Budget</span>
            </h1>
          </div>
          <button 
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black tracking-widest hover:bg-white hover:shadow-lg transition-all active:scale-95"
          >
            {language === 'fr' ? 'العربية' : 'FRANÇAIS'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && (
          <Dashboard language={language} transactions={transactions} categories={categories} savingsGoal={savingsGoal} />
        )}
        {activeTab === 'transactions' && (
          <TransactionList language={language} transactions={transactions} categories={categories} onDelete={deleteTransaction} />
        )}
        {activeTab === 'settings' && (
          <Settings language={language} categories={categories} onUpdateLimit={updateCategoryLimit} savingsGoal={savingsGoal} onUpdateSavingsGoal={setSavingsGoal} />
        )}
      </main>

      {/* Modern Tab Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-3 shadow-2xl shadow-indigo-200 border border-slate-800 flex items-center justify-between">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            label={t.dashboard}
            icon={<LayoutDashboard size={20} />}
          />
          <NavButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            label={t.transactions}
            icon={<ReceiptText size={20} />}
          />
          
          {/* FAB Integrated in Nav */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:scale-110 active:scale-90 transition-all -mt-10 border-4 border-slate-900"
          >
            <Plus size={24} strokeWidth={3} />
          </button>

          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            label={t.settings}
            icon={<SettingsIcon size={20} />}
          />
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal 
          language={language}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={addTransaction}
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`${active ? 'bg-indigo-500/10 p-2 rounded-xl' : 'p-2'}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
