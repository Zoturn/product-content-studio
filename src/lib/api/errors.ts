import { NextResponse } from 'next/server';

// The shared shape for every non-2xx JSON response. See .claude/rules/api-and-validation.md.
export type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND';

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export function unauthorizedResponse(
  message = 'Authentication required.',
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
}

export function validationErrorResponse(
  fieldErrors: Record<string, string[]>,
  message = 'Some fields need attention.',
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message, fieldErrors } },
    { status: 400 },
  );
}

export function notFoundResponse(message = 'Not found.'): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
}
