import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatasourceUrl(): string {
  try {
    const parsed = new URL(env.DATABASE_URL);
    // Configure Neon pooling parameters for Render Free tier efficiency
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '10');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '10');
    }
    return parsed.toString();
  } catch {
    return env.DATABASE_URL;
  }
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl(),
      },
    },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

global.prisma = prisma;

