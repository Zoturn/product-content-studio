import { SignJWT } from 'jose';
import { env } from '@/lib/env';
import { signSession, verifySession, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from './session';

describe('session tokens', () => {
  it('round-trips a signed session through verification', async () => {
    const token = await signSession({ sub: 'admin-1', email: 'admin@example.com' });
    const payload = await verifySession(token);
    expect(payload).toEqual({ sub: 'admin-1', email: 'admin@example.com' });
  });

  it('rejects a token with a tampered signature', async () => {
    const token = await signSession({ sub: 'admin-1', email: 'admin@example.com' });
    const [header, payload, signature] = token.split('.');

    // Flip a character in the middle of the signature, not the last one. A 256-bit HMAC
    // signature doesn't divide evenly into base64's 3-byte groups, so the final character
    // encodes only 2 significant bits plus zero-padding — some single-character swaps there
    // decode to the exact same bytes and leave the signature valid, which made this flaky.
    const flipIndex = Math.floor(signature.length / 2);
    const flippedChar = signature[flipIndex] === 'A' ? 'B' : 'A';
    const tamperedSignature =
      signature.slice(0, flipIndex) + flippedChar + signature.slice(flipIndex + 1);
    const tampered = `${header}.${payload}.${tamperedSignature}`;

    await expect(verifySession(tampered)).resolves.toBeNull();
  });

  it('rejects an expired token', async () => {
    // Signed directly with jose rather than through signSession, so the expiry can be forced
    // into the past instead of waiting two hours for a real one to lapse.
    const secretKey = new TextEncoder().encode(env.JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({ sub: 'admin-1', email: 'admin@example.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now - 100)
      .setExpirationTime(now - 10)
      .sign(secretKey);

    await expect(verifySession(expired)).resolves.toBeNull();
  });

  it('rejects a token signed with a different secret', async () => {
    const otherKey = new TextEncoder().encode('a-completely-different-secret-key-value');
    const foreign = await new SignJWT({ sub: 'admin-1', email: 'admin@example.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(otherKey);

    await expect(verifySession(foreign)).resolves.toBeNull();
  });

  it('rejects input that is not a JWT at all', async () => {
    await expect(verifySession('not-a-real-token')).resolves.toBeNull();
  });

  it('uses a fixed cookie name across the app', () => {
    expect(SESSION_COOKIE_NAME).toBe('pcs_session');
  });

  it('sets a two-hour lifetime', () => {
    expect(SESSION_TTL_SECONDS).toBe(60 * 60 * 2);
  });
});
