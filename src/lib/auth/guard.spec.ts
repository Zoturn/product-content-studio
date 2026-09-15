import { NextRequest } from 'next/server';
import { signSession } from './session';
import { requireAdmin } from './guard';

function requestWithCookieHeader(cookieHeader?: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/me', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

describe('requireAdmin', () => {
  it('is unauthorized when no cookie is present', async () => {
    const result = await requireAdmin(requestWithCookieHeader());
    expect(result).toEqual({ authorized: false });
  });

  it('is authorized for a valid session cookie', async () => {
    const token = await signSession({ sub: 'admin-1', email: 'admin@example.com' });
    const result = await requireAdmin(requestWithCookieHeader(`pcs_session=${token}`));

    expect(result).toEqual({
      authorized: true,
      admin: { sub: 'admin-1', email: 'admin@example.com' },
    });
  });

  it('is unauthorized for a malformed cookie value', async () => {
    const result = await requireAdmin(requestWithCookieHeader('pcs_session=not-a-real-token'));
    expect(result).toEqual({ authorized: false });
  });

  it('is unauthorized when a different cookie is present but pcs_session is not', async () => {
    const result = await requireAdmin(requestWithCookieHeader('some_other_cookie=value'));
    expect(result).toEqual({ authorized: false });
  });
});
