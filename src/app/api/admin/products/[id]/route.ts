import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/guard';
import { unauthorizedResponse, notFoundResponse, validationErrorFromZod } from '@/lib/api/errors';
import { productUpdateSchema } from '@/lib/validation/product';
import { getProductForEditing, updateProduct } from '@/lib/services/products';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return unauthorizedResponse();

  const { id } = await params;
  const product = await getProductForEditing(id);
  if (!product) return notFoundResponse('Product not found.');

  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return unauthorizedResponse();

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorFromZod(parsed.error);
  }

  const product = await updateProduct(id, parsed.data);
  if (!product) return notFoundResponse('Product not found.');

  return NextResponse.json(product);
}
