
import React, { useState, useEffect } from 'react';
import { BudgetState, Transaction, Category, Language } from './types';
import { INITIAL_CATEGORIES } from './constants';
import { translations } from './translations';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dz_budget_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dz_budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID()
    };
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
    <div className={`min-h-screen bg-slate-50 pb-24 ${isRtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            DzBudget
          </h1>
          <button 
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="px-3 py-1 rounded-full border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
          >
            {language === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            language={language} 
            transactions={transactions} 
            categories={categories} 
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionList 
            language={language} 
            transactions={transactions} 
            categories={categories}
            onDelete={deleteTransaction}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            language={language} 
            categories={categories} 
            onUpdateLimit={updateCategoryLimit}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center text-3xl hover:bg-indigo-700 transition-transform active:scale-95 z-40"
      >
        +
      </button>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 px-6 z-30">
        <div className="max-w-md mx-auto h-full flex items-center justify-between">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            label={t.dashboard}
            icon="📊"
          />
          <NavButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            label={t.transactions}
            icon="💸"
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            label={t.settings}
            icon="⚙️"
          />
        </div>
      </nav>

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

const NavButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-4 transition ${active ? 'text-indigo-600' : 'text-slate-400'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
