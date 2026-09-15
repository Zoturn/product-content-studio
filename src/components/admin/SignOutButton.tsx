'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import { apiFetch } from '@/lib/api/client';

export function SignOutButton() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => apiFetch<void>('/api/admin/logout', { method: 'POST' }),
    onSettled: () => {
      // Whether the call succeeded or the session had already expired, the client has no usable
      // session either way — send the admin back to sign-in in both cases.
      router.push('/admin/login');
      router.refresh();
    },
  });

  return (
    <Button variant="outlined" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      {mutation.isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
