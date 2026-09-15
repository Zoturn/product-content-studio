import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { getPublishedProducts } from '@/lib/services/products';

// Rendered per request, not cached — see openspec/changes/add-public-catalog/design.md. A
// product the admin has just unpublished must disappear immediately, not after an ISR window.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h1" gutterBottom>
          Product Content Studio
        </Typography>

        {products.length === 0 ? (
          <Typography color="text.secondary">No products are published yet.</Typography>
        ) : (
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {products.map((product) => (
              <ListItemButton
                key={product.slug}
                component={Link}
                href={`/products/${product.slug}`}
                divider
              >
                <ListItemText primary={product.name} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}
