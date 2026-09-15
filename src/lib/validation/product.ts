import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

// Single source of truth for the editable-field limits. The character counters in the editor
// read these same constants, so a limit can never drift between what the schema enforces and
// what the UI displays. See openspec/changes/.../design.md.
export const PRODUCT_LIMITS = {
  description: 1000,
  seoTitle: 60,
  seoDescription: 160,
} as const;

export const productUpdateSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(
        PRODUCT_LIMITS.description,
        `Description must be ${PRODUCT_LIMITS.description} characters or fewer`,
      ),
    seoTitle: z
      .string()
      .trim()
      .min(1, 'SEO title is required')
      .max(
        PRODUCT_LIMITS.seoTitle,
        `SEO title must be ${PRODUCT_LIMITS.seoTitle} characters or fewer`,
      ),
    seoDescription: z
      .string()
      .trim()
      .min(1, 'SEO description is required')
      .max(
        PRODUCT_LIMITS.seoDescription,
        `SEO description must be ${PRODUCT_LIMITS.seoDescription} characters or fewer`,
      ),
    // Derived from Prisma's generated enum rather than a hand-written literal union, so a third
    // status added to the schema can't silently drift out of sync with what's accepted here.
    status: z.enum(ProductStatus),
  })
  .strict();

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
