import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import * as txController from '../transaction.controller';
import * as txService from '../../services/transaction.service';
import { AuthenticatedRequest } from '../../middleware/auth';

jest.mock('../../services/transaction.service');
jest.mock('../../config/logger');

const app: Express = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, res, next) => {
  req.user = { id: 'user-123', email: 'test@example.com' };
  next();
});

app.post('/transactions', txController.create);
app.get('/transactions', txController.getAll);
app.get('/transactions/:id', txController.getById);
app.put('/transactions/:id', txController.update);
app.delete('/transactions/:id', txController.remove);
app.get('/balance', txController.getBalance);
app.get('/by-category', txController.getByCategory);
app.get('/monthly-summary', txController.getMonthlySummary);

describe('TransactionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /transactions', () => {
    it('should create a new transaction', async () => {
      const mockTx = {
        id: 'tx-1',
        userId: 'user-123',
        amount: 100,
        type: 'INCOME',
        category: 'Salary',
        date: '2024-01-01',
      };

      (txService.createTransaction as jest.Mock).mockResolvedValue(mockTx);

      const response = await request(app)
        .post('/transactions')
        .send({
          amount: 100,
          type: 'INCOME',
          category: 'Salary',
          date: '2024-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.amount).toBe(100);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: -100, // negative amount
          type: 'INCOME',
          category: 'Salary',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /transactions', () => {
    it('should return paginated transactions', async () => {
      const mockResult = {
        data: [
          { id: 'tx-1', amount: 100, type: 'INCOME' },
          { id: 'tx-2', amount: 50, type: 'EXPENSE' },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      };

      (txService.getTransactions as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by type', async () => {
      (txService.getTransactions as jest.Mock).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const response = await request(app).get('/transactions?type=INCOME');

      expect(response.status).toBe(200);
      expect(txService.getTransactions).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ type: 'INCOME' })
      );
    });
  });

  describe('GET /balance', () => {
    it('should return balance summary', async () => {
      const mockBalance = {
        income: 1000,
        expense: 400,
        balance: 600,
      };

      (txService.getBalance as jest.Mock).mockResolvedValue(mockBalance);

      const response = await request(app).get('/balance');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockBalance);
    });
  });

  describe('PUT /transactions/:id', () => {
    it('should update transaction', async () => {
      const mockUpdated = {
        id: 'tx-1',
        amount: 200,
        type: 'INCOME',
      };

      (txService.updateTransaction as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put('/transactions/tx-1')
        .send({ amount: 200 });

      expect(response.status).toBe(200);
      expect(response.body.data.amount).toBe(200);
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should delete transaction', async () => {
      (txService.deleteTransaction as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/transactions/tx-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transaction deleted');
    });
  });
});
