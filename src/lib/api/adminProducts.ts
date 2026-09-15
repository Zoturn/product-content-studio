import { apiFetch } from '@/lib/api/client';
import type { ProductUpdateInput } from '@/lib/validation/product';
// Type-only import: erased at compile time, so this never pulls src/lib/prisma.ts's runtime
// code (or the server-only module graph it depends on) into the client bundle. Reusing the
// service layer's own types here — rather than a second hand-typed copy — is what keeps this
// shape from drifting out of sync with what the server actually returns.
import type { EditableProduct, ProductListItem } from '@/lib/services/products';

// Client-side wrappers around the admin REST API. Stable query keys, per
// .claude/rules/data-fetching.md, so a mutation can invalidate precisely what changed.
export const adminProductKeys = {
  list: ['admin', 'products'] as const,
  detail: (id: string) => ['admin', 'product', id] as const,
};

export type AdminProductListItem = ProductListItem;
export type AdminProduct = EditableProduct;

export function fetchProductList(): Promise<AdminProductListItem[]> {
  return apiFetch<AdminProductListItem[]>('/api/admin/products');
}

export function fetchProduct(id: string): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}`);
}

export function saveProduct(id: string, input: ProductUpdateInput): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
