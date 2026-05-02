import { getPrismaClient } from '../config/database';
import { logger } from '../config/logger';

type TransactionType = 'INCOME' | 'EXPENSE';

export async function createTransaction(
  userId: string,
  data: {
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date: string;
  }
) {
  const prisma = getPrismaClient();
  const tx = await prisma.transaction.create({
    data: {
      userId,
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
    },
  });
  logger.info({ transactionId: tx.id, userId }, 'Transaction created');
  return tx;
}

export async function getTransactions(
  userId: string,
  filters?: {
    type?: TransactionType;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  const prisma = getPrismaClient();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters?.type) where.type = filters.type;
  if (filters?.category) where.category = { contains: filters.category, mode: 'insensitive' };
  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTransactionById(userId: string, id: string) {
  const prisma = getPrismaClient();
  const tx = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!tx) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }
  return tx;
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: Partial<{ amount: number; type: TransactionType; category: string; description: string; date: string }>
) {
  const prisma = getPrismaClient();
  await getTransactionById(userId, id); // ensure ownership

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
    },
  });
  logger.info({ transactionId: id, userId }, 'Transaction updated');
  return updated;
}

export async function deleteTransaction(userId: string, id: string) {
  const prisma = getPrismaClient();
  await getTransactionById(userId, id); // ensure ownership
  await prisma.transaction.delete({ where: { id } });
  logger.info({ transactionId: id, userId }, 'Transaction deleted');
}

export async function getBalance(userId: string) {
  const prisma = getPrismaClient();

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE' },
      _sum: { amount: true },
    }),
  ]);

  const income = Number(incomeResult._sum.amount ?? 0);
  const expense = Number(expenseResult._sum.amount ?? 0);
  const balance = income - expense;

  return { income, expense, balance };
}

export async function getByCategory(userId: string) {
  const prisma = getPrismaClient();

  const results = await prisma.transaction.groupBy({
    by: ['category', 'type'],
    where: { userId },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  });

  return results.map((r) => ({
    category: r.category,
    type: r.type,
    total: Number(r._sum.amount ?? 0),
    count: r._count,
  }));
}

export async function getMonthlySummary(userId: string, year: number) {
  const prisma = getPrismaClient();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    select: { amount: true, type: true, date: true },
  });

  const monthly: Record<number, { income: number; expense: number }> = {};
  for (let m = 1; m <= 12; m++) {
    monthly[m] = { income: 0, expense: 0 };
  }

  for (const tx of transactions) {
    const month = new Date(tx.date).getMonth() + 1;
    if (tx.type === 'INCOME') {
      monthly[month].income += Number(tx.amount);
    } else {
      monthly[month].expense += Number(tx.amount);
    }
  }

  return Object.entries(monthly).map(([month, data]) => ({
    month: parseInt(month),
    ...data,
    net: data.income - data.expense,
  }));
}
