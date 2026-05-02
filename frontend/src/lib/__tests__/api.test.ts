import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as api from '../api';

vi.mock('axios');

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth API', () => {
    it('should register user', async () => {
      const mockResponse = {
        data: {
          message: 'User registered',
          user: { id: '1', email: 'test@example.com' },
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await api.register('test@example.com', 'password123');

      expect(axios.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should login user', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { id: '1', email: 'test@example.com' },
          token: 'jwt-token',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await api.login('test@example.com', 'password123');

      expect(axios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout user', async () => {
      const mockResponse = { data: { message: 'Logged out' } };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await api.logout();

      expect(axios.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Transaction API', () => {
    it('should create transaction', async () => {
      const mockTx = {
        id: 'tx-1',
        amount: '100',
        type: 'INCOME',
        category: 'Salary',
        date: '2024-01-01',
      };

      vi.mocked(axios.post).mockResolvedValue({ data: { data: mockTx } });

      const result = await api.createTransaction({
        amount: 100,
        type: 'INCOME',
        category: 'Salary',
        date: '2024-01-01',
      });

      expect(axios.post).toHaveBeenCalledWith('/transactions', {
        amount: 100,
        type: 'INCOME',
        category: 'Salary',
        date: '2024-01-01',
      });
      expect(result.data).toEqual(mockTx);
    });

    it('should get transactions with filters', async () => {
      const mockData = {
        data: [{ id: 'tx-1', amount: '100' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await api.getTransactions({ type: 'INCOME', page: 1 });

      expect(axios.get).toHaveBeenCalledWith('/transactions', {
        params: { type: 'INCOME', page: 1 },
      });
      expect(result).toEqual(mockData);
    });

    it('should update transaction', async () => {
      const mockUpdated = { id: 'tx-1', amount: '200' };

      vi.mocked(axios.put).mockResolvedValue({ data: { data: mockUpdated } });

      const result = await api.updateTransaction('tx-1', { amount: 200 });

      expect(axios.put).toHaveBeenCalledWith('/transactions/tx-1', { amount: 200 });
      expect(result.data).toEqual(mockUpdated);
    });

    it('should delete transaction', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const result = await api.deleteTransaction('tx-1');

      expect(axios.delete).toHaveBeenCalledWith('/transactions/tx-1');
      expect(result.message).toBe('Deleted');
    });

    it('should get balance', async () => {
      const mockBalance = { income: 1000, expense: 400, balance: 600 };

      vi.mocked(axios.get).mockResolvedValue({ data: { data: mockBalance } });

      const result = await api.getBalance();

      expect(axios.get).toHaveBeenCalledWith('/transactions/balance');
      expect(result.data).toEqual(mockBalance);
    });
  });

  describe('Portfolio API', () => {
    it('should add position', async () => {
      const mockPosition = {
        id: 'pos-1',
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
      };

      vi.mocked(axios.post).mockResolvedValue({ data: { data: mockPosition } });

      const result = await api.addPosition({
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-01',
      });

      expect(axios.post).toHaveBeenCalledWith('/portfolio/positions', {
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-01',
      });
      expect(result.data).toEqual(mockPosition);
    });

    it('should get positions', async () => {
      const mockPositions = [
        { id: 'pos-1', symbol: 'AAPL' },
        { id: 'pos-2', symbol: 'GOOGL' },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: { data: mockPositions } });

      const result = await api.getPositions();

      expect(axios.get).toHaveBeenCalledWith('/portfolio/positions');
      expect(result.data).toEqual(mockPositions);
    });

    it('should update position', async () => {
      const mockUpdated = { id: 'pos-1', takeProfitPrice: 200 };

      vi.mocked(axios.put).mockResolvedValue({ data: { data: mockUpdated } });

      const result = await api.updatePosition('pos-1', { takeProfitPrice: 200 });

      expect(axios.put).toHaveBeenCalledWith('/portfolio/positions/pos-1', {
        takeProfitPrice: 200,
      });
      expect(result.data).toEqual(mockUpdated);
    });

    it('should delete position', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { message: 'Deleted' } });

      const result = await api.deletePosition('pos-1');

      expect(axios.delete).toHaveBeenCalledWith('/portfolio/positions/pos-1');
      expect(result.message).toBe('Deleted');
    });

    it('should get portfolio value', async () => {
      const mockValue = {
        totalValue: 10000,
        totalCost: 9000,
        totalPnl: 1000,
        positionCount: 3,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: { data: mockValue } });

      const result = await api.getPortfolioValue();

      expect(axios.get).toHaveBeenCalledWith('/portfolio/value');
      expect(result.data).toEqual(mockValue);
    });

    it('should get stock prices', async () => {
      const mockPrices = [
        { symbol: 'AAPL', data: { price: 160 } },
        { symbol: 'GOOGL', data: { price: 110 } },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: { data: mockPrices } });

      const result = await api.getStockPrices(['AAPL', 'GOOGL']);

      expect(axios.get).toHaveBeenCalledWith('/portfolio/prices', {
        params: { symbols: 'AAPL,GOOGL' },
      });
      expect(result.data).toEqual(mockPrices);
    });

    it('should search stocks', async () => {
      const mockResults = [
        { symbol: 'AAPL', description: 'Apple Inc.' },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: { data: mockResults } });

      const result = await api.searchStocks('apple');

      expect(axios.get).toHaveBeenCalledWith('/portfolio/search', {
        params: { q: 'apple' },
      });
      expect(result.data).toEqual(mockResults);
    });
  });
});
