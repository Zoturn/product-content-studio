import { ProductEditor } from '@/components/admin/ProductEditor';

type PageParams = { params: Promise<{ id: string }> };

export default async function AdminProductEditorPage({ params }: PageParams) {
  const { id } = await params;
  return <ProductEditor productId={id} />;
}
