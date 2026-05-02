import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as txService from '../transaction.service';
import { getPrismaClient } from '../../config/database';

jest.mock('../../config/database');
jest.mock('../../config/logger');

const mockPrisma = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
};

(getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

describe('TransactionService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const txData = {
        amount: 100,
        type: 'INCOME' as const,
        category: 'Salary',
        description: 'Monthly salary',
        date: '2024-01-01',
      };

      mockPrisma.transaction.create.mockResolvedValue({
        id: 'tx-1',
        userId,
        ...txData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await txService.createTransaction(userId, txData);

      expect(result).toHaveProperty('id');
      expect(result.amount).toBe(txData.amount);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          amount: txData.amount,
          type: txData.type,
        }),
      });
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTransactions = [
        { id: 'tx-1', amount: 100, type: 'INCOME' },
        { id: 'tx-2', amount: 50, type: 'EXPENSE' },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(2);

      const result = await txService.getTransactions(userId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by type', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await txService.getTransactions(userId, { type: 'INCOME' });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'INCOME' }),
        })
      );
    });
  });

  describe('getBalance', () => {
    it('should calculate balance correctly', async () => {
      mockPrisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 1000 } }) // income
        .mockResolvedValueOnce({ _sum: { amount: 400 } }); // expense

      const result = await txService.getBalance(userId);

      expect(result).toEqual({
        income: 1000,
        expense: 400,
        balance: 600,
      });
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', userId });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        amount: 200,
        type: 'INCOME',
      });

      const result = await txService.updateTransaction(userId, 'tx-1', { amount: 200 });

      expect(result.amount).toBe(200);
      expect(mockPrisma.transaction.update).toHaveBeenCalled();
    });

    it('should throw error if transaction not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(txService.updateTransaction(userId, 'invalid', {}))
        .rejects.toThrow('Transaction not found');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', userId });
      mockPrisma.transaction.delete.mockResolvedValue({});

      await txService.deleteTransaction(userId, 'tx-1');

      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
    });
  });
});
