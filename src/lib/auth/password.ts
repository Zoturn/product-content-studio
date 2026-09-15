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
