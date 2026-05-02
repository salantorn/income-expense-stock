import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import * as portfolioController from '../portfolio.controller';
import * as portfolioService from '../../services/portfolio.service';
import * as stockService from '../../services/stock.service';

jest.mock('../../services/portfolio.service');
jest.mock('../../services/stock.service');
jest.mock('../../config/logger');

const app: Express = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, res, next) => {
  req.user = { id: 'user-123', email: 'test@example.com' };
  next();
});

app.post('/positions', portfolioController.addPosition);
app.get('/positions', portfolioController.getPositions);
app.get('/positions/:id', portfolioController.getPositionById);
app.put('/positions/:id', portfolioController.updatePosition);
app.delete('/positions/:id', portfolioController.deletePosition);
app.get('/portfolio-value', portfolioController.getPortfolioValue);
app.get('/prices', portfolioController.getPrices);
app.get('/search', portfolioController.searchStocks);
app.get('/history/:symbol', portfolioController.getStockHistory);

describe('PortfolioController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /positions', () => {
    it('should add a new position', async () => {
      const mockPosition = {
        id: 'pos-1',
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-01',
        currentPrice: 160,
        pnl: 100,
      };

      (portfolioService.addPosition as jest.Mock).mockResolvedValue(mockPosition);

      const response = await request(app)
        .post('/positions')
        .send({
          symbol: 'AAPL',
          quantity: 10,
          purchasePrice: 150,
          purchaseDate: '2024-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.symbol).toBe('AAPL');
      expect(response.body.data.pnl).toBe(100);
    });

    it('should return 400 for invalid symbol', async () => {
      const response = await request(app)
        .post('/positions')
        .send({
          symbol: '', // empty symbol
          quantity: 10,
          purchasePrice: 150,
          purchaseDate: '2024-01-01',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative quantity', async () => {
      const response = await request(app)
        .post('/positions')
        .send({
          symbol: 'AAPL',
          quantity: -10,
          purchasePrice: 150,
          purchaseDate: '2024-01-01',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /positions', () => {
    it('should return all positions', async () => {
      const mockPositions = [
        {
          id: 'pos-1',
          symbol: 'AAPL',
          quantity: 10,
          currentPrice: 160,
          pnl: 100,
        },
        {
          id: 'pos-2',
          symbol: 'GOOGL',
          quantity: 5,
          currentPrice: 110,
          pnl: 50,
        },
      ];

      (portfolioService.getPositions as jest.Mock).mockResolvedValue(mockPositions);

      const response = await request(app).get('/positions');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PUT /positions/:id', () => {
    it('should update position with take profit and stop loss', async () => {
      const mockUpdated = {
        id: 'pos-1',
        takeProfitPrice: 200,
        stopLossPrice: 140,
      };

      (portfolioService.updatePosition as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put('/positions/pos-1')
        .send({
          takeProfitPrice: 200,
          stopLossPrice: 140,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.takeProfitPrice).toBe(200);
      expect(response.body.data.stopLossPrice).toBe(140);
    });
  });

  describe('GET /portfolio-value', () => {
    it('should return portfolio summary', async () => {
      const mockValue = {
        totalValue: 2150,
        totalCost: 2000,
        totalPnl: 150,
        totalPnlPercent: 7.5,
        positionCount: 2,
        positions: [],
      };

      (portfolioService.getPortfolioValue as jest.Mock).mockResolvedValue(mockValue);

      const response = await request(app).get('/portfolio-value');

      expect(response.status).toBe(200);
      expect(response.body.data.totalPnl).toBe(150);
      expect(response.body.data.positionCount).toBe(2);
    });
  });

  describe('GET /prices', () => {
    it('should return stock prices', async () => {
      const mockQuotes = [
        { symbol: 'AAPL', data: { price: 160, change: 5 } },
        { symbol: 'GOOGL', data: { price: 110, change: 2 } },
      ];

      (stockService.getMultipleQuotes as jest.Mock).mockResolvedValue(mockQuotes);

      const response = await request(app).get('/prices?symbols=AAPL,GOOGL');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 400 if symbols not provided', async () => {
      const response = await request(app).get('/prices');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /search', () => {
    it('should search stocks', async () => {
      const mockResults = [
        { symbol: 'AAPL', description: 'Apple Inc.' },
        { symbol: 'GOOGL', description: 'Alphabet Inc.' },
      ];

      (stockService.searchStocks as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app).get('/search?q=app');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('DELETE /positions/:id', () => {
    it('should delete position', async () => {
      (portfolioService.deletePosition as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/positions/pos-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Position deleted');
    });
  });
});
