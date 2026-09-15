import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/guard';
import { clearSessionCookie } from '@/lib/auth/session';
import { unauthorizedResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return unauthorizedResponse();

  const response = new NextResponse(null, { status: 204 });
  clearSessionCookie(response);
  return response;
}
