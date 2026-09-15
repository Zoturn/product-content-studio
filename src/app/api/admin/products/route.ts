import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/guard';
import { unauthorizedResponse } from '@/lib/api/errors';
import { listProducts } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return unauthorizedResponse();

  const products = await listProducts();
  return NextResponse.json(products);
}
