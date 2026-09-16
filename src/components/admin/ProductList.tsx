'use client';

import { useQuery } from '@tanstack/react-query';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { ProductStatus } from '@prisma/client';
import { adminProductKeys, fetchProductList } from '@/lib/api/adminProducts';
import { QueryState } from '@/components/admin/QueryState';

export function ProductList() {
  const query = useQuery({
    queryKey: adminProductKeys.list,
    queryFn: fetchProductList,
  });

  return (
    <QueryState
      query={query}
      errorMessage="Could not load the product list. Try reloading the page."
    >
      {(products) => (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {products.map((product) => {
            const isPublished = product.status === ProductStatus.PUBLISHED;
            return (
              <ListItemButton
                key={product.id}
                component={Link}
                href={`/admin/products/${product.id}`}
                divider
              >
                <ListItemText primary={product.name} />
                <Chip
                  label={isPublished ? 'Published' : 'Draft'}
                  color={isPublished ? 'success' : 'default'}
                  size="small"
                  variant={isPublished ? 'filled' : 'outlined'}
                />
              </ListItemButton>
            );
          })}
          {products.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No products yet.
            </Typography>
          )}
        </List>
      )}
    </QueryState>
  );
}
