import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session';
import { SignOutButton } from '@/components/admin/SignOutButton';

export const metadata: Metadata = {
  title: 'Admin — Product Content Studio',
};

// Reached only via middleware's guard, but reads its own session directly rather than trusting
// that — the same "check it yourself" discipline as every /api/admin/** route handler.
export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 3,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography variant="h1">Product Content Studio</Typography>
          <SignOutButton />
        </Stack>
        <Typography color="text.secondary" gutterBottom>
          Signed in as {session?.email ?? 'unknown'}.
        </Typography>
        <Typography color="text.secondary">
          The product list arrives with the add-product-editing change.
        </Typography>
      </Box>
    </Container>
  );
}
