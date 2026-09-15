import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductUpdateInput } from '@/lib/validation/product';

// All product queries live here — see .claude/rules/prisma-data-model.md. add-public-catalog
// extends this file with the published-only read path; nothing here filters by status yet
// because this change has no public-facing surface.

export type ProductListItem = {
  id: string;
  name: string;
  status: ProductStatus;
};

export function listProducts(): Promise<ProductListItem[]> {
  return prisma.product.findMany({
    select: { id: true, name: true, status: true },
    orderBy: { name: 'asc' },
  });
}

// Shared by every read/write that needs the full editable shape, so a column added to one
// query can't silently miss the other — see the "reuse" finding from the full-project review.
const PRODUCT_EDIT_SELECT = {
  id: true,
  slug: true,
  name: true,
  attributes: true,
  description: true,
  seoTitle: true,
  seoDescription: true,
  status: true,
} satisfies Prisma.ProductSelect;

export type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  // Prisma's Json scalar has no shape guarantee at the type level. Callers must narrow before
  // treating this as an object — see ProductEditor.tsx's asAttributeEntries().
  attributes: unknown;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: ProductStatus;
};

export function getProductForEditing(id: string): Promise<EditableProduct | null> {
  return prisma.product.findUnique({
    where: { id },
    select: PRODUCT_EDIT_SELECT,
  });
}

// Writes only the four editable fields — name and attributes are never accepted here, matching
// the product-editing spec's "Only content and status are editable" requirement. A single
// update() call rather than a findUnique-then-update pair: Prisma's own P2025 ("record to
// update not found") error carries the same "not found" information, so there's no need to
// pay two round trips to learn it once.
export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
): Promise<EditableProduct | null> {
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        description: input.description,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        status: input.status,
      },
      select: PRODUCT_EDIT_SELECT,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}
