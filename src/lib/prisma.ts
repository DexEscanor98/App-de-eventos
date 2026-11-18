import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getRuntimeDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL_POOLED;
  if (!configuredUrl) return undefined;

  try {
    const url = new URL(configuredUrl);
    // Keep one client connection per serverless instance and let Prisma Postgres pool across instances.
    url.searchParams.set('connection_limit', '1');
    url.searchParams.set('pool_timeout', '20');
    return url.toString();
  } catch {
    return configuredUrl;
  }
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDatabaseUrl ? { datasources: { db: { url: runtimeDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;
