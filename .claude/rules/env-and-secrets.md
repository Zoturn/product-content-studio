---
paths:
  - ".env.example"
  - "src/lib/env.ts"
  - "docker-compose.yml"
  - "Dockerfile"
---

# Environment and secrets

**Scope:** How configuration is declared, read and kept out of the repository and the browser. It does not cover session or password mechanics, which belong to `api-and-validation.md`.

## Rules

1. Document every variable the app reads in `.env.example` with a placeholder value, because a variable that exists only in one developer's shell is a setup step nobody else can discover.
2. Never put a real credential in `.env.example`, and keep `.env` gitignored — a secret committed once is compromised even after it is deleted, since the history keeps it.
3. Read `DATABASE_URL`, `JWT_SECRET` and `ADMIN_PASSWORD` only in server-only modules, and never import such a module from a file marked `'use client'`, because anything reachable from a client component is bundled and shipped to the browser.
4. Prefix nothing secret with `NEXT_PUBLIC_`, since that prefix is an instruction to publish the value into the client bundle where anyone can read it.
5. Validate configuration once at startup in `src/lib/env.ts` and fail loudly on a missing required variable, because an app that boots with `undefined` fails later, somewhere else, for a reason that looks unrelated.
6. Export typed values from that module rather than letting callers touch `process.env`, so the type system knows a variable is a string and the check cannot be skipped.
7. Hash the admin password from `ADMIN_PASSWORD` at seed time with bcryptjs and commit neither the password nor the resulting hash, because a committed hash is an offline cracking target handed to whoever clones the repo.
8. Select explicit fields in every response payload rather than spreading a database row, so a secret column cannot ride along into JSON the day someone adds it.
9. Keep secrets out of logs and error messages, including the connection string in a caught database error, since logs are copied into issues and chat far more casually than the `.env` file is.
10. Point the local `DATABASE_URL` at the Docker Compose database with throwaway development credentials, so the checked-in default is useless to anyone who finds it.
11. Grep the built client output for each secret's value after a production build, because that check takes seconds and is the only direct evidence that nothing leaked.
12. Treat any secret that has been exposed as spent and rotate it rather than deleting the line, since an exposed value cannot be un-seen.

## Examples

```ts
// no: unchecked, untyped, and repeated wherever it is needed
const secret = process.env.JWT_SECRET!;

// yes: one validated module, exported typed
const parsed = envSchema.safeParse(process.env);
if (!parsed.success)
  throw new Error(`Invalid environment: ${parsed.error.message}`);
export const env = parsed.data;
```

```bash
# .env.example — no: a real value, and a secret marked for publication
DATABASE_URL="postgresql://admin:S3cretProdPass@db.example.com:5432/pcs"
NEXT_PUBLIC_JWT_SECRET="..."

# yes: placeholders, server-only names
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pcs"
JWT_SECRET="replace-with-a-32-byte-random-string"
ADMIN_PASSWORD="replace-before-seeding"
```

## Anti-patterns

- A secret read in a shared helper that a client component also imports, pulling it into the browser bundle.
- `NEXT_PUBLIC_` applied to make a value "just work" on the client, publishing it as a side effect.
- Default fallbacks like `process.env.JWT_SECRET ?? 'dev-secret'`, which let production start with a known key.
- An `.env.example` that lags the code, so a fresh clone fails at runtime with no indication of what is missing.
- Logging the full configuration object at startup "for debugging", writing every secret into the log stream.
