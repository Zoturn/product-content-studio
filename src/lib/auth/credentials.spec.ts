import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashPassword } from './password';
import { verifyCredentials } from './credentials';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    adminUser: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedFindUnique = prisma.adminUser.findUnique as jest.Mock;

describe('verifyCredentials', () => {
  it('accepts the correct password for a known email', async () => {
    const passwordHash = await hashPassword('correct-horse');
    mockedFindUnique.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash,
    });

    const result = await verifyCredentials('admin@example.com', 'correct-horse');

    expect(result).toEqual({ valid: true, admin: { id: 'admin-1', email: 'admin@example.com' } });
  });

  it('refuses a wrong password for a known email', async () => {
    const passwordHash = await hashPassword('correct-horse');
    mockedFindUnique.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash,
    });

    const result = await verifyCredentials('admin@example.com', 'wrong-password');

    expect(result).toEqual({ valid: false });
  });

  it('refuses an unknown email identically to a wrong password', async () => {
    mockedFindUnique.mockResolvedValueOnce(null);

    const result = await verifyCredentials('nobody@example.com', 'whatever');

    expect(result).toEqual({ valid: false });
  });

  it('never returns the password hash, even on success', async () => {
    const passwordHash = await hashPassword('correct-horse');
    mockedFindUnique.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash,
    });

    const result = await verifyCredentials('admin@example.com', 'correct-horse');

    expect(result).not.toHaveProperty('admin.passwordHash');
    expect(JSON.stringify(result)).not.toContain(passwordHash);
  });

  it('looks up the email case-insensitively, so a capitalized submission still matches', async () => {
    const passwordHash = await hashPassword('correct-horse');
    mockedFindUnique.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash,
    });

    const result = await verifyCredentials('Admin@Example.com', 'correct-horse');

    expect(mockedFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'admin@example.com' } }),
    );
    expect(result).toEqual({ valid: true, admin: { id: 'admin-1', email: 'admin@example.com' } });
  });

  // Proves the timing mitigation is actually exercised, not just that the outcome is right —
  // see design.md's "One refusal for both unknown email and wrong password".
  it('still runs a bcrypt compare for an unknown email, rather than short-circuiting', async () => {
    mockedFindUnique.mockResolvedValueOnce(null);
    const compareSpy = jest.spyOn(bcrypt, 'compare');

    await verifyCredentials('nobody@example.com', 'whatever');

    expect(compareSpy).toHaveBeenCalledTimes(1);
    compareSpy.mockRestore();
  });
});
