import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePortfolio } from '../usePortfolio';
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

describe('usePortfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePositions', () => {
    it('should fetch positions', async () => {
      const mockPositions = {
        data: [
          {
            id: 'pos-1',
            portfolioId: 'portfolio-1',
            symbol: 'AAPL',
            quantity: 10,
            purchasePrice: 150,
            purchaseDate: '2024-01-01',
            currentPrice: 160,
            pnl: 100,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
      };

      vi.mocked(api.getPositions).mockResolvedValue(mockPositions);

      const { result } = renderHook(() => usePortfolio().usePositions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toHaveLength(1);
      expect(result.current.data?.data[0].symbol).toBe('AAPL');
    });
  });

  describe('usePortfolioValue', () => {
    it('should fetch portfolio value', async () => {
      const mockValue = {
        data: {
          totalValue: 2150,
          totalCost: 2000,
          totalPnl: 150,
          totalPnlPercent: 7.5,
          positionCount: 2,
          positions: [],
        },
      };

      vi.mocked(api.getPortfolioValue).mockResolvedValue(mockValue);

      const { result } = renderHook(() => usePortfolio().usePortfolioValue(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data.totalPnl).toBe(150);
      expect(result.current.data?.data.positionCount).toBe(2);
    });
  });

  describe('useAddPosition', () => {
    it('should add position', async () => {
      const mockPosition = {
        data: {
          id: 'pos-1',
          portfolioId: 'portfolio-1',
          symbol: 'AAPL',
          quantity: 10,
          purchasePrice: 150,
          purchaseDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      vi.mocked(api.addPosition).mockResolvedValue(mockPosition);

      const { result } = renderHook(() => usePortfolio().useAddPosition(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.addPosition).toHaveBeenCalled();
    });
  });

  describe('useUpdatePosition', () => {
    it('should update position with take profit and stop loss', async () => {
      const mockUpdated = {
        data: {
          id: 'pos-1',
          portfolioId: 'portfolio-1',
          symbol: 'AAPL',
          quantity: 10,
          purchasePrice: 150,
          purchaseDate: '2024-01-01',
          takeProfitPrice: 200,
          stopLossPrice: 140,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      vi.mocked(api.updatePosition).mockResolvedValue(mockUpdated);

      const { result } = renderHook(() => usePortfolio().useUpdatePosition(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: 'pos-1',
        data: { takeProfitPrice: 200, stopLossPrice: 140 },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.updatePosition).toHaveBeenCalledWith('pos-1', {
        takeProfitPrice: 200,
        stopLossPrice: 140,
      });
    });
  });

  describe('useDeletePosition', () => {
    it('should delete position', async () => {
      vi.mocked(api.deletePosition).mockResolvedValue({ message: 'Deleted' });

      const { result } = renderHook(() => usePortfolio().useDeletePosition(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('pos-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.deletePosition).toHaveBeenCalledWith('pos-1');
    });
  });

  describe('useStockPrices', () => {
    it('should fetch stock prices', async () => {
      const mockPrices = {
        data: [
          { symbol: 'AAPL', data: { price: 160, change: 5, changePercent: 3.2, high: 165, low: 155, open: 158, previousClose: 155, timestamp: Date.now() } },
          { symbol: 'GOOGL', data: { price: 110, change: 2, changePercent: 1.8, high: 112, low: 108, open: 109, previousClose: 108, timestamp: Date.now() } },
        ],
      };

      vi.mocked(api.getStockPrices).mockResolvedValue(mockPrices);

      const { result } = renderHook(() => usePortfolio().useStockPrices(['AAPL', 'GOOGL']), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toHaveLength(2);
    });
  });

  describe('useStockSearch', () => {
    it('should search stocks', async () => {
      const mockResults = {
        data: [
          { symbol: 'AAPL', description: 'Apple Inc.', displaySymbol: 'AAPL', type: 'Common Stock' },
          { symbol: 'GOOGL', description: 'Alphabet Inc.', displaySymbol: 'GOOGL', type: 'Common Stock' },
        ],
      };

      vi.mocked(api.searchStocks).mockResolvedValue(mockResults);

      const { result } = renderHook(() => usePortfolio().useStockSearch('app'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toHaveLength(2);
    });
  });
});
