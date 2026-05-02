import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as portfolioService from '../portfolio.service';
import * as stockService from '../stock.service';
import { getPrismaClient } from '../../config/database';

jest.mock('../../config/database');
jest.mock('../../config/logger');
jest.mock('../stock.service');

const mockPrisma = {
  portfolio: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  stockPosition: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

(getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

describe('PortfolioService', () => {
  const userId = 'user-123';
  const portfolioId = 'portfolio-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addPosition', () => {
    it('should add a new stock position', async () => {
      const positionData = {
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-01',
      };

      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      (stockService.getStockQuote as jest.Mock).mockResolvedValue({
        symbol: 'AAPL',
        price: 160,
        change: 10,
        changePercent: 6.67,
      });
      mockPrisma.stockPosition.create.mockResolvedValue({
        id: 'pos-1',
        portfolioId,
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await portfolioService.addPosition(userId, positionData);

      expect(result).toHaveProperty('id');
      expect(result.symbol).toBe('AAPL');
      expect(result.currentPrice).toBe(160);
      expect(result.pnl).toBeGreaterThan(0);
      expect(mockPrisma.stockPosition.create).toHaveBeenCalled();
    });

    it('should throw error if stock not found', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      (stockService.getStockQuote as jest.Mock).mockRejectedValue(new Error('Stock not found'));

      await expect(
        portfolioService.addPosition(userId, {
          symbol: 'INVALID',
          quantity: 10,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        })
      ).rejects.toThrow();
    });
  });

  describe('getPositions', () => {
    it('should return all positions with live prices', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        {
          id: 'pos-1',
          portfolioId,
          symbol: 'AAPL',
          quantity: 10,
          purchasePrice: 150,
          purchaseDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (stockService.getMultipleQuotes as jest.Mock).mockResolvedValue([
        {
          symbol: 'AAPL',
          data: { price: 160, change: 10, changePercent: 6.67 },
        },
      ]);

      const result = await portfolioService.getPositions(userId);

      expect(result).toHaveLength(1);
      expect(result[0].currentPrice).toBe(160);
      expect(result[0].pnl).toBeGreaterThan(0);
    });

    it('should return empty array if no positions', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      mockPrisma.stockPosition.findMany.mockResolvedValue([]);

      const result = await portfolioService.getPositions(userId);

      expect(result).toEqual([]);
    });
  });

  describe('updatePosition', () => {
    it('should update position with take profit and stop loss', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      mockPrisma.stockPosition.findFirst.mockResolvedValue({
        id: 'pos-1',
        portfolioId,
        symbol: 'AAPL',
      });
      mockPrisma.stockPosition.update.mockResolvedValue({
        id: 'pos-1',
        takeProfitPrice: 200,
        stopLossPrice: 140,
      });

      const result = await portfolioService.updatePosition(userId, 'pos-1', {
        takeProfitPrice: 200,
        stopLossPrice: 140,
      });

      expect(result.takeProfitPrice).toBe(200);
      expect(result.stopLossPrice).toBe(140);
    });
  });

  describe('getPortfolioValue', () => {
    it('should calculate total portfolio value', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        {
          id: 'pos-1',
          symbol: 'AAPL',
          quantity: 10,
          purchasePrice: 150,
        },
        {
          id: 'pos-2',
          symbol: 'GOOGL',
          quantity: 5,
          purchasePrice: 100,
        },
      ]);
      (stockService.getMultipleQuotes as jest.Mock).mockResolvedValue([
        { symbol: 'AAPL', data: { price: 160 } },
        { symbol: 'GOOGL', data: { price: 110 } },
      ]);

      const result = await portfolioService.getPortfolioValue(userId);

      expect(result.positionCount).toBe(2);
      expect(result.totalValue).toBe(1600 + 550); // 10*160 + 5*110
      expect(result.totalCost).toBe(1500 + 500); // 10*150 + 5*100
      expect(result.totalPnl).toBeGreaterThan(0);
    });
  });

  describe('deletePosition', () => {
    it('should delete a position', async () => {
      mockPrisma.portfolio.findUnique.mockResolvedValue({ id: portfolioId, userId });
      mockPrisma.stockPosition.findFirst.mockResolvedValue({ id: 'pos-1', portfolioId });
      mockPrisma.stockPosition.delete.mockResolvedValue({});

      await portfolioService.deletePosition(userId, 'pos-1');

      expect(mockPrisma.stockPosition.delete).toHaveBeenCalledWith({ where: { id: 'pos-1' } });
    });
  });
});
