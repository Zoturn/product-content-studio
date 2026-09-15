import { SignJWT, jwtVerify } from 'jose';
import type { NextResponse } from 'next/server';
import { env } from '@/lib/env';

// jose, not jsonwebtoken: verification runs in Next.js middleware (the Edge runtime) and again
// inside route handlers (Node), and jose is the one library that works unchanged in both.
// See openspec/changes/.../design.md.
export const SESSION_COOKIE_NAME = 'pcs_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 2; // two hours — see design.md's cookie-flags decision

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export type SessionPayload = {
  sub: string;
  email: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey);
}

// Returns null for anything that isn't a currently-valid session: absent, tampered, expired, or
// carrying an unexpected payload shape. Callers treat all of these identically — see the
// "Altered or expired session" scenario in specs/admin-authentication/spec.md.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...cookieOptions, maxAge: 0 });
}
