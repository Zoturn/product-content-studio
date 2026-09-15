import { NextResponse, type NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validation/auth';
import { verifyCredentials } from '@/lib/auth/credentials';
import { signSession, setSessionCookie } from '@/lib/auth/session';
import { unauthorizedResponse, validationErrorFromZod } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorFromZod(parsed.error);
  }

  const result = await verifyCredentials(parsed.data.email, parsed.data.password);

  // One generic message for both an unknown email and a wrong password — see the "Signing in"
  // requirement in specs/admin-authentication/spec.md.
  if (!result.valid) {
    return unauthorizedResponse('Incorrect email or password.');
  }

  const token = await signSession({ sub: result.admin.id, email: result.admin.email });
  const response = NextResponse.json({ email: result.admin.email });
  setSessionCookie(response, token);
  return response;
}
