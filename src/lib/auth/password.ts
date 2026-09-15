import bcrypt from 'bcryptjs';

// bcryptjs, not bcrypt: pure JS, no native addon to fail differently on a reviewer's machine.
// See .claude/rules/prisma-data-model.md and openspec/changes/.../design.md.
const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Synchronous variant, used only for the timing-safe dummy hash in credentials.ts — computed
// once at module load, not per request. bcryptjs is imported in exactly this one file; every
// other module reaches it through these exports rather than importing bcryptjs itself.
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}
