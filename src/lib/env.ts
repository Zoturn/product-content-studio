import { z } from 'zod';

// The only place application code reads process.env. A missing variable fails here, at import
// time, with the variable's name — not later as an obscure signing or connection error deep
// inside a request. See .claude/rules/env-and-secrets.md and .claude/rules/typescript.md.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(
      `Missing or invalid environment variable(s): ${missing}. Check your .env file.`,
    );
  }
  return parsed.data;
}

export const env = loadEnv();
