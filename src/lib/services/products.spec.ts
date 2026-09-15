import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateProduct } from './products';
import type { ProductUpdateInput } from '@/lib/validation/product';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      update: jest.fn(),
    },
  },
}));

const mockedUpdate = prisma.product.update as jest.Mock;

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
