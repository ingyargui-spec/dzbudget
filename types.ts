
export type Language = 'fr' | 'ar';

export type AccountType = 'CASH' | 'SALARY' | 'SAVINGS';

export interface Category {
  id: string;
  nameFr: string;
  nameAr: string;
  limit: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  accountType: AccountType;
  type: 'INCOME' | 'EXPENSE';
}

export interface BudgetState {
  transactions: Transaction[];
  categories: Category[];
  language: Language;
}
