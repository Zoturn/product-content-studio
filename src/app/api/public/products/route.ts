import { NextResponse } from 'next/server';
import { getPublishedProducts } from '@/lib/services/products';

// No session required — src/middleware.ts's matcher covers /admin/** and /api/admin/** only,
// never /api/public/**. See .claude/rules/prisma-data-model.md: the published-only filter lives
// inside getPublishedProducts()'s query, not as a check here.
export async function GET() {
  const products = await getPublishedProducts();
  return NextResponse.json(products);
}
