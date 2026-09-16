import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import { getProductForEditing, updateProduct } from '@/lib/services/products';

/**
 * Most route behaviour is tested over real HTTP in Cypress, per .claude/rules/testing.md rule 2.
 * This file is the deliberate exception, because the thing under test is precisely what an HTTP
 * test cannot see.
 *
 * `middleware.ts` already matches /api/admin/:path*, so every Cypress assertion about an
 * unauthenticated request is answered by the middleware before the handler is ever reached.
 * Delete the `requireAdmin` call from either handler below and the whole end-to-end suite still
 * passes — the middleware covers for it. That makes the defence-in-depth that
 * .claude/rules/api-and-validation.md rule 7 requires completely unverified by the suite that
 * appears to cover it.
 *
 * It is not a hypothetical concern here: this project shipped `middleware.ts` at the repo root
 * for a while, where Next silently never registers it, and these in-handler checks were the only
 * thing standing between a signed-out request and admin data.
 *
 * So these tests call the exported handlers directly — no middleware in the path — and assert
 * they refuse on their own.
 */
jest.mock('@/lib/services/products', () => ({
  getProductForEditing: jest.fn(),
  updateProduct: jest.fn(),
}));

const mockedGetProductForEditing = getProductForEditing as jest.Mock;
const mockedUpdateProduct = updateProduct as jest.Mock;

function requestWithoutSession(method: 'GET' | 'PATCH') {
  return new NextRequest('http://localhost/api/admin/products/any-id', {
    method,
    ...(method === 'PATCH'
      ? {
          body: JSON.stringify({ description: 'x' }),
          headers: { 'Content-Type': 'application/json' },
        }
      : {}),
  });
}

const params = { params: Promise.resolve({ id: 'any-id' }) };

describe('admin product route, with middleware bypassed', () => {
  it('GET refuses a request carrying no session cookie', async () => {
    const response = await GET(requestWithoutSession('GET'), params);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  });

  it('PATCH refuses a request carrying no session cookie', async () => {
    const response = await PATCH(requestWithoutSession('PATCH'), params);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  });

  it('refuses before reading or writing anything', async () => {
    // The status code alone would be satisfied by a handler that queried the database and then
    // decided to answer 401. This is the assertion that says no unauthorised request reaches the
    // data layer at all.
    await GET(requestWithoutSession('GET'), params);
    await PATCH(requestWithoutSession('PATCH'), params);

    expect(mockedGetProductForEditing).not.toHaveBeenCalled();
    expect(mockedUpdateProduct).not.toHaveBeenCalled();
  });

  it('refuses a session cookie that is present but not a valid token', async () => {
    const request = new NextRequest('http://localhost/api/admin/products/any-id');
    request.cookies.set('pcs_session', 'not-a-jwt');

    const response = await GET(request, params);

    expect(response.status).toBe(401);
    expect(mockedGetProductForEditing).not.toHaveBeenCalled();
  });
});
