import { productUpdateSchema, PRODUCT_LIMITS } from './product';

const valid = {
  description: 'a'.repeat(500),
  seoTitle: 'a'.repeat(30),
  seoDescription: 'a'.repeat(80),
  status: 'DRAFT' as const,
};

describe('productUpdateSchema', () => {
  it('accepts values exactly at each limit', () => {
    const result = productUpdateSchema.safeParse({
      ...valid,
      description: 'a'.repeat(PRODUCT_LIMITS.description),
      seoTitle: 'a'.repeat(PRODUCT_LIMITS.seoTitle),
      seoDescription: 'a'.repeat(PRODUCT_LIMITS.seoDescription),
    });
    expect(result.success).toBe(true);
  });

  it('rejects a description one character over the limit', () => {
    const result = productUpdateSchema.safeParse({
      ...valid,
      description: 'a'.repeat(PRODUCT_LIMITS.description + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'description')).toBe(true);
    }
  });

  it('rejects an SEO title one character over the limit', () => {
    const result = productUpdateSchema.safeParse({
      ...valid,
      seoTitle: 'a'.repeat(PRODUCT_LIMITS.seoTitle + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'seoTitle')).toBe(true);
    }
  });

  it('rejects an SEO description one character over the limit', () => {
    const result = productUpdateSchema.safeParse({
      ...valid,
      seoDescription: 'a'.repeat(PRODUCT_LIMITS.seoDescription + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'seoDescription')).toBe(true);
    }
  });

  it.each(['description', 'seoTitle', 'seoDescription'] as const)(
    'rejects an empty %s',
    (field) => {
      const result = productUpdateSchema.safeParse({ ...valid, [field]: '' });
      expect(result.success).toBe(false);
    },
  );

  it.each(['description', 'seoTitle', 'seoDescription'] as const)(
    'rejects a whitespace-only %s',
    (field) => {
      const result = productUpdateSchema.safeParse({ ...valid, [field]: '   ' });
      expect(result.success).toBe(false);
    },
  );

  it('rejects an invalid status value', () => {
    const result = productUpdateSchema.safeParse({ ...valid, status: 'ARCHIVED' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown key such as name, proving .strict()', () => {
    const result = productUpdateSchema.safeParse({ ...valid, name: 'Hacked Name' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown key such as attributes', () => {
    const result = productUpdateSchema.safeParse({ ...valid, attributes: { color: 'red' } });
    expect(result.success).toBe(false);
  });

  it('accepts a fully valid payload', () => {
    const result = productUpdateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
