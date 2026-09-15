import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/guard';
import { unauthorizedResponse } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return unauthorizedResponse();

  // Email only — never the password hash, even implicitly via a spread. See
  // .claude/rules/env-and-secrets.md.
  return NextResponse.json({ email: auth.admin.email });
}
