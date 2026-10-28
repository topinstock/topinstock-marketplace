import { PrismaClient } from '@prisma/client';

// ============================================
//   Singleton Prisma Client
//   Prevents multiple instances during Next.js
//   hot-reloading in development
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (!globalForPrisma.prisma && process.env.DATABASE_URL?.includes('sqlite')) {
  // Apply SQLite performance & reliability PRAGMAs once on startup
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA mmap_size = 268435456;').catch(() => {});
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
