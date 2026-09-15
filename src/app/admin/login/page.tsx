import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — Product Content Studio',
};

// Server Component: only LoginForm needs 'use client', pushed as far down the tree as possible.
// See .claude/rules/nextjs-app-router.md.
export default function AdminLoginPage() {
  return (
    <Container maxWidth="xs">
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: '1.5rem' }}>
          Sign in
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
}
