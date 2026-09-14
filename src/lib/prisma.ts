import { PrismaClient } from '@prisma/client';

// Cached on globalThis outside production, because hot reload otherwise creates a new client on
// every edit until the database refuses further connections. See .claude/rules/prisma-data-model.md.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
