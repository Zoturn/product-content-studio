import { products } from './seed-data';

// Mirrors the VarChar limits in schema.prisma and the limits the editor's validator will
// enforce, so the seeded starting state is never itself invalid. See
// .claude/rules/prisma-data-model.md.
const LIMITS = { description: 1000, seoTitle: 60, seoDescription: 160 };

describe('seed product fixtures', () => {
  it('seeds exactly three products', () => {
    expect(products).toHaveLength(3);
  });

  it('includes at least one draft and one published product', () => {
    const statuses = products.map((p) => p.status);
    expect(statuses).toContain('DRAFT');
    expect(statuses).toContain('PUBLISHED');
  });

  it('uses a unique slug per product', () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(products.map((p) => [p.slug, p] as const))(
    '%s satisfies the editor length limits',
    (_slug, product) => {
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.description.length).toBeLessThanOrEqual(LIMITS.description);

      expect(product.seoTitle.length).toBeGreaterThan(0);
      expect(product.seoTitle.length).toBeLessThanOrEqual(LIMITS.seoTitle);

      expect(product.seoDescription.length).toBeGreaterThan(0);
      expect(product.seoDescription.length).toBeLessThanOrEqual(LIMITS.seoDescription);

      expect(product.name.length).toBeGreaterThan(0);
    },
  );
});
