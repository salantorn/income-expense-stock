import { getPrismaClient } from '../config/database';
import { getMultipleQuotes, getStockQuote } from './stock.service';
import { logger } from '../config/logger';

async function getOrCreatePortfolio(userId: string) {
  const prisma = getPrismaClient();
  let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({ data: { userId } });
  }
  return portfolio;
}

export async function addPosition(
  userId: string,
  data: { symbol: string; quantity: number; purchasePrice: number; purchaseDate: string }
) {
  const prisma = getPrismaClient();
  const portfolio = await getOrCreatePortfolio(userId);

  // Validate symbol exists by fetching price - MUST succeed
  let currentPrice: number;
  try {
    const quote = await getStockQuote(data.symbol);
    currentPrice = quote.price;
    logger.info({ symbol: data.symbol, price: currentPrice }, 'Fetched current price for new position');
  } catch (error: any) {
    logger.error(
      { symbol: data.symbol, error: error.message },
      'Failed to fetch stock price - cannot add position'
    );
    throw Object.assign(
      new Error(`No stock data found for ${data.symbol.toUpperCase()} in the system. Please check the stock symbol and try again.`),
      { statusCode: 404, code: 'STOCK_NOT_FOUND' }
    );
  }

  const position = await prisma.stockPosition.create({
    data: {
      portfolioId: portfolio.id,
      symbol: data.symbol.toUpperCase(),
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseDate: new Date(data.purchaseDate),
    },
  });

  logger.info({ positionId: position.id, userId, symbol: position.symbol }, 'Stock position added');
  
  // Return position with current price data
  const quantity = Number(position.quantity);
  const purchasePrice = Number(position.purchasePrice);
  const currentValue = currentPrice * quantity;
  const costBasis = purchasePrice * quantity;
  const pnl = currentValue - costBasis;
  const pnlPercent = ((currentValue - costBasis) / costBasis) * 100;

  return {
    ...position,
    quantity,
    purchasePrice,
    currentPrice,
    currentValue,
    costBasis,
    pnl,
    pnlPercent,
    change: 0,
    changePercent: 0,
  };
}

export async function getPositions(userId: string) {
  const prisma = getPrismaClient();
  const portfolio = await getOrCreatePortfolio(userId);

  const positions = await prisma.stockPosition.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { createdAt: 'desc' },
  });

  if (positions.length === 0) return [];

  // Fetch live prices for all symbols
  const symbols = [...new Set(positions.map((p) => p.symbol))];
  const quotes = await getMultipleQuotes(symbols);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q.data]));

  return positions.map((position) => {
    const quote = quoteMap.get(position.symbol);
    const currentPrice = quote?.price ?? Number(position.purchasePrice);
    const quantity = Number(position.quantity);
    const purchasePrice = Number(position.purchasePrice);
    const currentValue = currentPrice * quantity;
    const costBasis = purchasePrice * quantity;
    const pnl = currentValue - costBasis;
    const pnlPercent = ((currentValue - costBasis) / costBasis) * 100;

    return {
      ...position,
      quantity,
      purchasePrice,
      currentPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPercent,
      change: quote?.change ?? 0,
      changePercent: quote?.changePercent ?? 0,
    };
  });
}

export async function getPositionById(userId: string, id: string) {
  const prisma = getPrismaClient();
  const portfolio = await getOrCreatePortfolio(userId);

  const position = await prisma.stockPosition.findFirst({
    where: { id, portfolioId: portfolio.id },
  });

  if (!position) {
    throw Object.assign(new Error('Position not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }
  return position;
}

export async function updatePosition(
  userId: string,
  id: string,
  data: Partial<{ quantity: number; purchasePrice: number; purchaseDate: string; takeProfitPrice: number | null; stopLossPrice: number | null }>
) {
  const prisma = getPrismaClient();
  const position = await getPositionById(userId, id);

  const updated = await prisma.stockPosition.update({
    where: { id: position.id },
    data: {
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
      ...(data.purchaseDate !== undefined && { purchaseDate: new Date(data.purchaseDate) }),
      ...(data.takeProfitPrice !== undefined && { takeProfitPrice: data.takeProfitPrice, isTakeProfitAlerted: false }),
      ...(data.stopLossPrice !== undefined && { stopLossPrice: data.stopLossPrice, isStopLossAlerted: false }),
    },
  });

  logger.info({ positionId: id, userId }, 'Position updated');
  return updated;
}

export async function deletePosition(userId: string, id: string) {
  const prisma = getPrismaClient();
  const position = await getPositionById(userId, id);
  await prisma.stockPosition.delete({ where: { id: position.id } });
  logger.info({ positionId: id, userId }, 'Position deleted');
}

export async function getPortfolioValue(userId: string) {
  const positions = await getPositions(userId);

  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent,
    positionCount: positions.length,
    positions,
  };
}
