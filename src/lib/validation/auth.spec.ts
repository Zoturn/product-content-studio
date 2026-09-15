import { loginSchema } from './auth';

describe('loginSchema', () => {
  it('accepts a well-formed payload', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'ChangeMe123!' });
    expect(result.success).toBe(true);
  });

  it('lowercases the email, so a capitalized login attempt matches a lowercase-stored account', () => {
    const result = loginSchema.safeParse({ email: 'Admin@Example.com', password: 'ChangeMe123!' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@example.com');
    }
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'ChangeMe123!' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown key, proving .strict()', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'ChangeMe123!',
      remember: true,
    });
    expect(result.success).toBe(false);
  });
});
