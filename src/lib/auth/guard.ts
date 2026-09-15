import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySession, type SessionPayload } from '@/lib/auth/session';

// Discriminated union, not an optional field: a caller must check `authorized` before it can
// reach `admin`, so the ordinary signed-out case can never be mistaken for a valid session.
// See .claude/rules/typescript.md.
export type AdminAuthResult = { authorized: true; admin: SessionPayload } | { authorized: false };

// Called explicitly at the top of every /api/admin/** handler, in addition to middleware.ts —
// this is what makes an admin endpoint unreachable without a session regardless of whether the
// middleware matcher covers it. See openspec/changes/.../design.md.
export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return { authorized: false };

  const session = await verifySession(token);
  if (!session) return { authorized: false };

  return { authorized: true, admin: session };
}
