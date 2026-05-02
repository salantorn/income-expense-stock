import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactions } from '../useTransactions';
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTransactionList', () => {
    it('should fetch transactions', async () => {
      const mockData = {
        data: [
          { id: 'tx-1', amount: '100', type: 'INCOME' as const, category: 'Salary', date: '2024-01-01', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: 'tx-2', amount: '50', type: 'EXPENSE' as const, category: 'Food', date: '2024-01-01', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      };

      vi.mocked(api.getTransactions).mockResolvedValue(mockData);

      const { result } = renderHook(() => useTransactions().useTransactionList({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toHaveLength(2);
    });
  });

  describe('useBalance', () => {
    it('should fetch balance', async () => {
      const mockBalance = {
        data: { income: 1000, expense: 400, balance: 600 },
      };

      vi.mocked(api.getBalance).mockResolvedValue(mockBalance);

      const { result } = renderHook(() => useTransactions().useBalance(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data.balance).toBe(600);
    });
  });

  describe('useCreateTransaction', () => {
    it('should create transaction', async () => {
      const mockTx = {
        data: {
          id: 'tx-1',
          amount: '100',
          type: 'INCOME' as const,
          category: 'Salary',
          date: '2024-01-01',
          userId: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      vi.mocked(api.createTransaction).mockResolvedValue(mockTx);

      const { result } = renderHook(() => useTransactions().useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        amount: 100,
        type: 'INCOME',
        category: 'Salary',
        date: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.createTransaction).toHaveBeenCalled();
    });
  });

  describe('useUpdateTransaction', () => {
    it('should update transaction', async () => {
      const mockUpdated = {
        data: { id: 'tx-1', amount: '200', type: 'INCOME' as const, category: 'Salary', date: '2024-01-01', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      };

      vi.mocked(api.updateTransaction).mockResolvedValue(mockUpdated);

      const { result } = renderHook(() => useTransactions().useUpdateTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'tx-1', data: { amount: 200 } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.updateTransaction).toHaveBeenCalledWith('tx-1', { amount: 200 });
    });
  });

  describe('useDeleteTransaction', () => {
    it('should delete transaction', async () => {
      vi.mocked(api.deleteTransaction).mockResolvedValue({ message: 'Deleted' });

      const { result } = renderHook(() => useTransactions().useDeleteTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('tx-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.deleteTransaction).toHaveBeenCalledWith('tx-1');
    });
  });
});
