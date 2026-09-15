import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPasswordSync } from '@/lib/auth/password';

// A real bcrypt hash, computed once at module load, of a value that is never used as a
// credential. Compared against when no account matches the submitted email, so an unknown email
// costs roughly the same time as a wrong password — see design.md's "One refusal for both
// unknown email and wrong password".
const DUMMY_HASH = hashPasswordSync('unused-timing-placeholder');

export type CredentialsResult =
  { valid: true; admin: { id: string; email: string } } | { valid: false };

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<CredentialsResult> {
  // Lowercased defensively here too, not only in the login schema — this function's own
  // contract (a case-insensitive email lookup) shouldn't depend on every caller having already
  // normalized the input. See .claude/rules/env-and-secrets.md on not trusting a single layer.
  const normalizedEmail = email.trim().toLowerCase();

  // Explicit select, including passwordHash only because this function needs it to verify — it
  // is never returned. See .claude/rules/prisma-data-model.md.
  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, passwordHash: true },
  });

  const matches = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !matches) {
    return { valid: false };
  }

  return { valid: true, admin: { id: admin.id, email: admin.email } };
}
