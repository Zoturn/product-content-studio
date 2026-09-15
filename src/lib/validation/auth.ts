import { z } from 'zod';

export const loginSchema = z
  .object({
    // Lowercased, not just trimmed: the stored admin email is lowercase (see prisma/seed.ts),
    // and email addresses are conventionally case-insensitive for the local+domain match a
    // login is actually checking. Without this, a capitalized autofill/autocapitalize submits a
    // correct password against a case-mismatched lookup and is refused as "incorrect
    // credentials" — see the "case-sensitive email lookup" finding from the full-project review.
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
