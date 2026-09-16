import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { getPublishedProductBySlug } from '@/lib/services/products';
import { formatAttributes } from '@/lib/attributes';

// Rendered per request, not cached — matches the catalogue. See
// openspec/changes/add-public-catalog/design.md.
export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ slug: string }> };

// generateMetadata and the page body both need this product for the same request. Wrapped with
// React's cache() so that's one query, not two — the two callers still go through the exact
// same published-only function, which is what actually matters for correctness (see design.md's
// "generateMetadata calls the same helper as the page body").
const getProduct = cache(getPublishedProductBySlug);

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  // No product (draft or unknown) means no metadata to hand back — the page body's notFound()
  // is what actually produces the 404; returning {} here just avoids leaking an SEO title for
  // a page that won't render.
  if (!product) return {};

  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        {/* A real link rather than router.back(): this page is reachable directly by URL and by
            a search result, where there is no history to go back to. next/link also keeps the
            page a Server Component — navigation is not interactivity. */}
        <MuiLink component={Link} href="/" sx={{ display: 'inline-block', mb: 2 }}>
          ← Back to products
        </MuiLink>
        <Typography variant="h1" gutterBottom>
          {product.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {formatAttributes(product.attributes)}
        </Typography>
        {/* A text child, never dangerouslySetInnerHTML — React escapes this automatically, so
            author-typed markup (e.g. a <script> payload) renders as inert visible text. Line
            breaks come from CSS on the plain string, not from converting \n to <br>, which would
            reopen the hole plain-text rendering closes. */}
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{product.description}</Typography>
      </Box>
    </Container>
  );
}
