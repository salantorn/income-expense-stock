import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as portfolioService from '../services/portfolio.service';
import * as stockService from '../services/stock.service';
import { AuthenticatedRequest } from '../middleware/auth';

const addPositionSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const updatePositionSchema = addPositionSchema.omit({ symbol: true }).partial().extend({
  takeProfitPrice: z.number().positive().nullable().optional(),
  stopLossPrice: z.number().positive().nullable().optional(),
});

export async function addPosition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const validated = addPositionSchema.parse(req.body);
    const position = await portfolioService.addPosition(req.user!.id, {
      symbol: validated.symbol,
      quantity: validated.quantity,
      purchasePrice: validated.purchasePrice,
      purchaseDate: validated.purchaseDate,
    });
    res.status(201).json({ data: position });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function getPositions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const positions = await portfolioService.getPositions(req.user!.id);
    res.json({ data: positions });
  } catch (error) {
    next(error);
  }
}

export async function getPositionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const position = await portfolioService.getPositionById(req.user!.id, req.params.id);
    res.json({ data: position });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function updatePosition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = updatePositionSchema.parse(req.body);
    const updateData: Partial<{
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      takeProfitPrice: number | null;
      stopLossPrice: number | null;
    }> = {};
    
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate;
    if (data.takeProfitPrice !== undefined) updateData.takeProfitPrice = data.takeProfitPrice;
    if (data.stopLossPrice !== undefined) updateData.stopLossPrice = data.stopLossPrice;
    
    const position = await portfolioService.updatePosition(req.user!.id, req.params.id, updateData);
    res.json({ data: position });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function deletePosition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await portfolioService.deletePosition(req.user!.id, req.params.id);
    res.json({ message: 'Position deleted' });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function getPortfolioValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const value = await portfolioService.getPortfolioValue(req.user!.id);
    res.json({ data: value });
  } catch (error) {
    next(error);
  }
}

export async function getPrices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { symbols } = req.query;
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'symbols query param required' });
    }
    const symbolList = symbols.split(',').map((s) => s.trim().toUpperCase());
    const quotes = await stockService.getMultipleQuotes(symbolList);
    res.json({ data: quotes });
  } catch (error) {
    next(error);
  }
}

export async function searchStocks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'query param q required' });
    const results = await stockService.searchStocks(q as string);
    res.json({ data: results });
  } catch (error) {
    next(error);
  }
}

export async function getStockHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    if (!['1D', '1W', '1M', '1Y'].includes(timeframe as string)) {
       return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'timeframe must be 1D, 1W, 1M, or 1Y' });
    }
    const history = await stockService.getStockHistory(symbol, timeframe as '1D'|'1W'|'1M'|'1Y');
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
}

