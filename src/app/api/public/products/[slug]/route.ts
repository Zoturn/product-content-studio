import { NextResponse, type NextRequest } from 'next/server';
import { notFoundResponse } from '@/lib/api/errors';
import { getPublishedProductBySlug } from '@/lib/services/products';

type RouteParams = { params: Promise<{ slug: string }> };

// A draft slug and an unknown slug answer identically — both resolve to null from
// getPublishedProductBySlug and get the same 404, so this endpoint can't be used to discover
// which slugs exist but aren't published yet. See openspec/changes/.../design.md.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    return notFoundResponse('Product not found.');
  }

  return NextResponse.json(product);
}
