'use client';

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
  });

  // Derived rather than held in state: useMutation already clears `error` the moment mutate() is
  // called, so a separate useState would only be a second copy of this to keep in sync. Typed
  // field values stay put either way — only the banner changes. See
  // .claude/rules/ui-and-ux-states.md.
  const serverError = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'Something went wrong.'
    : null;

  const onSubmit = handleSubmit((values) => {
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
