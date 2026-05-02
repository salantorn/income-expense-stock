import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../DashboardPage';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with balance', async () => {
    vi.mocked(api.getBalance).mockResolvedValue({
      data: { income: 5000, expense: 2000, balance: 3000 },
    });

    vi.mocked(api.getTransactions).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    vi.mocked(api.getPortfolioValue).mockResolvedValue({
      data: {
        totalValue: 10000,
        totalCost: 9000,
        totalPnl: 1000,
        totalPnlPercent: 11.11,
        positionCount: 3,
        positions: [],
      },
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/balance/i)).toBeInTheDocument();
    });
  });

  it('should display income, expense, and balance cards', async () => {
    vi.mocked(api.getBalance).mockResolvedValue({
      data: { income: 5000, expense: 2000, balance: 3000 },
    });

    vi.mocked(api.getTransactions).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    vi.mocked(api.getPortfolioValue).mockResolvedValue({
      data: {
        totalValue: 10000,
        totalCost: 9000,
        totalPnl: 1000,
        totalPnlPercent: 11.11,
        positionCount: 3,
        positions: [],
      },
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('5000')).toBeInTheDocument(); // income
      expect(screen.getByText('2000')).toBeInTheDocument(); // expense
      expect(screen.getByText('3000')).toBeInTheDocument(); // balance
    });
  });

  it('should show portfolio value', async () => {
    vi.mocked(api.getBalance).mockResolvedValue({
      data: { income: 5000, expense: 2000, balance: 3000 },
    });

    vi.mocked(api.getTransactions).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    vi.mocked(api.getPortfolioValue).mockResolvedValue({
      data: {
        totalValue: 10000,
        totalCost: 9000,
        totalPnl: 1000,
        totalPnlPercent: 11.11,
        positionCount: 3,
        positions: [],
      },
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(api.getBalance).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
