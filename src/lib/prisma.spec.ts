import { prisma as first } from './prisma';
import { prisma as second } from './prisma';

describe('prisma client singleton', () => {
  it('exports the same instance across imports, rather than constructing a new client per import', () => {
    expect(first).toBe(second);
  });

  it('caches the instance on globalThis outside production, so hot reload reuses the connection pool', () => {
    const globalForPrisma = globalThis as unknown as { prisma?: unknown };
    expect(globalForPrisma.prisma).toBe(first);
  });
});
