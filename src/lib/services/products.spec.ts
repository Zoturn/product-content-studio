import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateProduct, getPublishedProducts, getPublishedProductBySlug } from './products';
import type { ProductUpdateInput } from '@/lib/validation/product';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedUpdate = prisma.product.update as jest.Mock;
const mockedFindMany = prisma.product.findMany as jest.Mock;
const mockedFindFirst = prisma.product.findFirst as jest.Mock;

const input: ProductUpdateInput = {
  description: 'Updated description.',
  seoTitle: 'Updated title',
  seoDescription: 'Updated SEO description.',
  status: 'PUBLISHED',
};

function notFoundError() {
  return new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
    code: 'P2025',
    clientVersion: 'test',
  });
}

describe('updateProduct', () => {
  it('writes only the four editable fields, never name or attributes', async () => {
    mockedUpdate.mockResolvedValueOnce({ id: 'product-1', ...input });

    await updateProduct('product-1', input);

    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-1' },
        data: {
          description: input.description,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          status: input.status,
        },
      }),
    );

    const call = mockedUpdate.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('name');
    expect(call.data).not.toHaveProperty('attributes');
  });

  it('returns null for a product that does not exist, rather than throwing', async () => {
    mockedUpdate.mockRejectedValueOnce(notFoundError());

    const result = await updateProduct('does-not-exist', input);

    expect(result).toBeNull();
  });

  it('rethrows an error that is not Prisma\'s "record not found"', async () => {
    mockedUpdate.mockRejectedValueOnce(new Error('connection lost'));

    await expect(updateProduct('product-1', input)).rejects.toThrow('connection lost');
  });
});

describe('getPublishedProducts', () => {
  it('filters to published in the query, not by post-filtering the result', async () => {
    mockedFindMany.mockResolvedValueOnce([
      { slug: 'wireless-mouse', name: 'Aurora Wireless Mouse' },
    ]);

    await getPublishedProducts();

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED' },
      }),
    );
  });
});

describe('getPublishedProductBySlug', () => {
  it('puts the status constraint inside the query', async () => {
    mockedFindFirst.mockResolvedValueOnce(null);

    await getPublishedProductBySlug('wireless-mouse');

    expect(mockedFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'wireless-mouse', status: 'PUBLISHED' },
      }),
    );
  });

  it('resolves null for a draft slug, exactly as for an unknown slug', async () => {
    // Asserting only "mock returns null, so function returns null" would pass even if the
    // status filter were deleted — it would prove nothing about draft exclusion. So this also
    // asserts the constraint is in the query, which is what actually makes the two cases
    // indistinguishable to a caller: a draft is not found for the same reason a typo is.
    mockedFindFirst.mockResolvedValueOnce(null);

    const result = await getPublishedProductBySlug('smart-desk-lamp');

    expect(result).toBeNull();
    expect(mockedFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'smart-desk-lamp', status: 'PUBLISHED' },
      }),
    );
  });
});
