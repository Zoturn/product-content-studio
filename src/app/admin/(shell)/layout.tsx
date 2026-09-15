import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { SignOutButton } from '@/components/admin/SignOutButton';

// Wraps the authenticated admin screens (list, editor) with a persistent header and sign-out
// control. Deliberately NOT applied to /admin/login, which stays a standalone screen — see the
// (shell) route group boundary.
export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 4,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>
            <Link href="/admin/products" style={{ color: 'inherit', textDecoration: 'none' }}>
              Product Content Studio
            </Link>
          </Typography>
          <SignOutButton />
        </Stack>
        {children}
      </Box>
    </Container>
  );
}
