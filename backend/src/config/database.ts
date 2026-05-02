import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'> | null = null;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log queries in development
    prisma.$on('query', (e: any) => {
      logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query');
    });

    prisma.$on('error', (e: any) => {
      logger.error({ target: e.target, message: e.message }, 'Database error');
    });

    prisma.$on('warn', (e: any) => {
      logger.warn({ target: e.target, message: e.message }, 'Database warning');
    });
  }

  return prisma;
}

export async function connectDatabase(): Promise<void> {
  const client = getPrismaClient();
  await client.$connect();
  logger.info('Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Database disconnected');
  }
}
