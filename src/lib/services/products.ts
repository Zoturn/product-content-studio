import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductUpdateInput } from '@/lib/validation/product';

// All product queries live here — see .claude/rules/prisma-data-model.md.

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

// --- Published-only reads: the single choke point every public caller goes through. ---
// See .claude/rules/prisma-data-model.md rule 4 and openspec/changes/.../design.md — the status
// constraint lives inside the query, never as a check bolted on after a plain lookup. The
// catalogue page, the product page, generateMetadata and both public API routes all call these
// two functions; none of them may write its own `where` clause for status.

export type PublishedProductListItem = {
  slug: string;
  name: string;
};

export function getPublishedProducts(): Promise<PublishedProductListItem[]> {
  return prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    select: { slug: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export type PublishedProduct = {
  slug: string;
  name: string;
  attributes: unknown;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

// findFirst with status in the where clause, not findUnique followed by a status check — a
// filter in the query cannot be skipped by an early return or a refactor that drops the check.
// Returns null identically for a draft slug and an unknown slug, so callers (the page's
// notFound(), the public API's 404) cannot tell the two apart either.
export function getPublishedProductBySlug(slug: string): Promise<PublishedProduct | null> {
  return prisma.product.findFirst({
    where: { slug, status: ProductStatus.PUBLISHED },
    select: {
      slug: true,
      name: true,
      attributes: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}
