import { redirect } from 'next/navigation';

// The product list is the real landing page now that add-product-editing has shipped it.
export default function AdminIndexPage() {
  redirect('/admin/products');
}
