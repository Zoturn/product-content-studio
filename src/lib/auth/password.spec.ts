import { hashPassword, verifyPassword, hashPasswordSync } from './password';

describe('password hashing', () => {
  it('round-trips: a hash verifies against the plaintext it was made from', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    await expect(verifyPassword('correct-horse-battery-staple', hash)).resolves.toBe(true);
  });

  it('rejects the wrong password against a real hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('salts each hash independently, so identical passwords produce different hashes', async () => {
    const [a, b] = await Promise.all([
      hashPassword('same-password'),
      hashPassword('same-password'),
    ]);
    expect(a).not.toBe(b);
  });

  it('hashPasswordSync produces a hash verifyPassword accepts', async () => {
    const hash = hashPasswordSync('correct-horse-battery-staple');
    await expect(verifyPassword('correct-horse-battery-staple', hash)).resolves.toBe(true);
  });
});
