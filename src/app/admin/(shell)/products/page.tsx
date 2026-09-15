import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';
import { ProductList } from '@/components/admin/ProductList';

export const metadata: Metadata = {
  title: 'Products — Product Content Studio',
};

export default function AdminProductsPage() {
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: '1.125rem', mb: 2 }}>
        Products
      </Typography>
      <ProductList />
    </>
  );
}
