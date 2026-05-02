import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as txService from '../services/transaction.service';
import { AuthenticatedRequest } from '../middleware/auth';

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const updateSchema = createSchema.partial();

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const tx = await txService.createTransaction(req.user!.id, {
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
    });
    res.status(201).json({ data: tx });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const result = await txService.getTransactions(req.user!.id, {
      type: type as any,
      category: category as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.getTransactionById(req.user!.id, req.params.id);
    res.json({ data: tx });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const updateData: Partial<{
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      category: string;
      description: string;
      date: string;
    }> = {};
    
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = data.date;
    
    const tx = await txService.updateTransaction(req.user!.id, req.params.id, updateData);
    res.json({ data: tx });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await txService.deleteTransaction(req.user!.id, req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const balance = await txService.getBalance(req.user!.id);
    res.json({ data: balance });
  } catch (error) {
    next(error);
  }
}

export async function getByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await txService.getByCategory(req.user!.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await txService.getMonthlySummary(req.user!.id, year);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
