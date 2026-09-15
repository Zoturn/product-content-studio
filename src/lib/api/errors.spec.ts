import { z } from 'zod';
import { validationErrorFromZod } from './errors';

const schema = z.object({ description: z.string().min(1) }).strict();

async function bodyOf(response: Response) {
  return response.json() as Promise<{
    error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
  }>;
}

describe('validationErrorFromZod', () => {
  it('maps a field-level issue into fieldErrors, keyed by field', async () => {
    const result = schema.safeParse({ description: '' });
    if (result.success) throw new Error('expected failure');

    const response = validationErrorFromZod(result.error);
    const body = await bodyOf(response);

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fieldErrors?.description).toBeDefined();
  });

  it('folds a .strict() unrecognized-key issue into the message, not a silently empty fieldErrors', async () => {
    const result = schema.safeParse({ description: 'ok', name: 'not allowed' });
    if (result.success) throw new Error('expected failure');

    const response = validationErrorFromZod(result.error);
    const body = await bodyOf(response);

    // The bug this guards against: formErrors (no field path) being dropped entirely,
    // leaving the caller with fieldErrors: {} and no indication of what was rejected.
    expect(body.error.message).toContain('name');
    expect(body.error.fieldErrors).toEqual({});
  });
});
