import type { ApiErrorCode } from '@/lib/api/errors';

// Client-side fetch wrapper for the admin REST API. No secrets here — this file is imported from
// 'use client' components. See .claude/rules/data-fetching.md.
export class ApiError extends Error {
  code: ApiErrorCode | 'UNKNOWN';
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    code: ApiErrorCode | 'UNKNOWN',
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error =
      body && typeof body === 'object' && 'error' in body
        ? (
            body as {
              error: { message?: string; code?: string; fieldErrors?: Record<string, string[]> };
            }
          ).error
        : undefined;

    throw new ApiError(
      error?.message ?? 'Something went wrong.',
      (error?.code as ApiErrorCode | undefined) ?? 'UNKNOWN',
      error?.fieldErrors,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
