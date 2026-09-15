'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { loginSchema, type LoginInput } from '@/lib/validation/auth';
import { apiFetch, ApiError } from '@/lib/api/client';

type LoginResponse = { email: string };

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<LoginResponse>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      router.push('/admin');
      router.refresh();
    },
    onError: (error) => {
      // Typed field values stay put — only the error banner changes. See
      // .claude/rules/ui-and-ux-states.md.
      setServerError(error instanceof ApiError ? error.message : 'Something went wrong.');
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    mutation.mutate(values);
  });

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={2} noValidate>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={mutation.isPending}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={mutation.isPending}
        {...register('password')}
      />
      <Button type="submit" variant="contained" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </Stack>
  );
}
