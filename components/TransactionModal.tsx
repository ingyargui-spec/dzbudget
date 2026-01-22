
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl ${language === 'ar' ? 'rtl font-arabic' : ''}`}>
        <h2 className="text-xl font-bold mb-6 text-indigo-600">{t.addTransaction}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.type}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-2 rounded-lg border transition ${type === 'EXPENSE' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-gray-50 border-gray-200'}`}
              >
                {t.expense}
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 py-2 rounded-lg border transition ${type === 'INCOME' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-200'}`}
              >
                {t.income}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.description}</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-200 rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.amount}</label>
              <input
                type="number"
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-right"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.account}</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
              >
                <option value="CASH">{t.cash}</option>
                <option value="SALARY">{t.salary}</option>
              </select>
            </div>
          </div>

          {type === 'EXPENSE' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t.category}</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg"
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
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
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
