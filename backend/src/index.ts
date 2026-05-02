import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { getMultipleQuotes } from './services/stock.service';
import { getPrismaClient } from './config/database';
import { sendTargetPriceAlertEmail } from './utils/email';

// Routes
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import portfolioRoutes from './routes/portfolio.routes';

const app = express();
const httpServer = createServer(app);

// Socket.io with CORS
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(err.statusCode || 500).json({
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: config.server.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

// ─── Socket.io — Real-time Stock Prices ──────────────────────────────────────

const connectedUsers = new Map<string, string>(); // socketId -> userId (from query)

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Client connected');

  // Client sends their JWT userId to subscribe to updates
  socket.on('subscribe:portfolio', async (userId: string) => {
    connectedUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);
    logger.debug({ socketId: socket.id, userId }, 'User subscribed to portfolio updates');
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    logger.debug({ socketId: socket.id }, 'Client disconnected');
  });
});

// Broadcast live stock prices every 30 seconds
async function broadcastPrices() {
  const prisma = getPrismaClient();
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: { positions: true, user: true },
    });

    for (const portfolio of portfolios) {
      if (portfolio.positions.length === 0) continue;

      const symbols = [...new Set(portfolio.positions.map((p) => p.symbol))];
      const quotes = await getMultipleQuotes(symbols);

      const quoteMap = new Map();
      quotes.forEach(q => { if (q.data) quoteMap.set(q.symbol, q.data); });

      for (const pos of portfolio.positions) {
        const livePrice = quoteMap.get(pos.symbol)?.price;
        if (!livePrice) continue;

        if (pos.takeProfitPrice && livePrice >= Number(pos.takeProfitPrice) && !pos.isTakeProfitAlerted) {
          await sendTargetPriceAlertEmail(portfolio.user.email, pos.symbol, Number(pos.takeProfitPrice), livePrice, 'TAKE_PROFIT').catch(err => logger.error(err));
          await prisma.stockPosition.update({ where: { id: pos.id }, data: { isTakeProfitAlerted: true } });
        }

        if (pos.stopLossPrice && livePrice <= Number(pos.stopLossPrice) && !pos.isStopLossAlerted) {
          await sendTargetPriceAlertEmail(portfolio.user.email, pos.symbol, Number(pos.stopLossPrice), livePrice, 'STOP_LOSS').catch(err => logger.error(err));
          await prisma.stockPosition.update({ where: { id: pos.id }, data: { isStopLossAlerted: true } });
        }
      }

      io.to(`user:${portfolio.userId}`).emit('portfolio:prices', {
        quotes: quotes.filter((q) => q.data !== null),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error({ error }, 'Error broadcasting prices');
  }
}

// ─── Server Startup ───────────────────────────────────────────────────────────

async function startServer() {
  try {
    await connectDatabase();
    logger.info('Database connection established');

    // Try to connect to Redis, but don't fail if it's not available
    try {
      await connectRedis();
      logger.info('Redis connection established');
    } catch (redisError) {
      logger.warn({ redisError }, 'Redis connection failed - continuing without cache');
    }

    httpServer.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
      logger.info(`Health check: http://localhost:${config.server.port}/health`);
    });

    // Start price broadcasting (every 10 seconds)
    setInterval(broadcastPrices, 10_000);

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

async function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  try {
    io.close();
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
