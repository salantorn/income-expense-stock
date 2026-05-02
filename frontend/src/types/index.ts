// ─── User & Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  createdAt: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: 'LIGHT' | 'DARK';
  currency: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  userId: string;
  amount: string; // Prisma Decimal comes as string
  type: TransactionType;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Balance {
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  type: TransactionType;
  total: number;
  count: number;
}

export interface MonthlySummary {
  month: number;
  income: number;
  expense: number;
  net: number;
}

// ─── Portfolio & Stock ────────────────────────────────────────────────────────
export interface StockPosition {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: string | number; // Support both string (from API) and number
  purchasePrice: string | number;
  purchaseDate: string;
  takeProfitPrice?: string | number | null;
  stopLossPrice?: string | number | null;
  isTakeProfitAlerted?: boolean;
  isStopLossAlerted?: boolean;
  createdAt: string;
  updatedAt: string;
  // Live data (added by service)
  currentPrice?: number;
  currentValue?: number;
  costBasis?: number;
  pnl?: number;
  pnlPercent?: number;
  change?: number;
  changePercent?: number;
}

export interface PortfolioValue {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  positionCount: number;
  positions: StockPosition[];
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface StockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
