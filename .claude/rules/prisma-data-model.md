---
paths:
  - "prisma/**"
  - "src/lib/prisma.ts"
  - "src/lib/services/**"
---

# Prisma and the data model

**Scope:** The Prisma schema, migrations, the seed, and the service layer that is the only place queries are written. It does not cover HTTP shapes or validation, which belong to `api-and-validation.md`.

## Rules

1. Export one `PrismaClient` from `src/lib/prisma.ts` and cache it on `globalThis` outside production, because hot reload otherwise creates a new client per edit until the database refuses further connections.
2. Write every product query in `src/lib/services/**` rather than in a page or route handler, so the rules about what is visible to whom live in one reviewable file instead of being restated at each call site.
3. Read public product data only through the published-only helpers, since one forgotten status filter in one route is enough to leak a draft the rest of the app carefully hides.
4. Express the published constraint as `findFirst({ where: { slug, status: 'PUBLISHED' } })`, not a `findUnique` followed by a status check, because a filter in the query cannot be skipped by an early return or a refactor that drops the check.
5. Ship every schema change with a generated migration committed alongside it, and never `db push` against a schema that already has a migration history, because the next developer's database can only reproduce what the migration files describe.
6. Keep migrations forward-only and reviewed as code — a migration is the one part of the app that runs against real data exactly once.
7. Mirror the Zod length limits in the schema with `@db.VarChar`, as defence in depth: validation runs first and returns a structured error, while the column is the backstop for anything that reaches the database another way.
8. Never `select` `passwordHash` into a value that leaves the server, and prefer explicit `select` over returning whole rows so a new sensitive column cannot start leaking the day it is added.
9. Treat `name` and `attributes` as read-only in every write path, because the brief grants the admin no authority over them and an update that accepts them invents a feature nobody specified.
10. Keep the seed idempotent with `upsert` and deterministic in its slugs and content, since end-to-end tests assert against known fixtures and a seed that varies makes failures unreproducible.
11. Hash the seeded admin password from an environment variable at seed time; a password or a hash committed to the repository is a secret with no way back.
12. Let service functions return `null` for "not visible" rather than throwing, so callers answer with the same 404 for a draft as for a record that does not exist.

## Examples

```ts
// no: fetches the row first, then decides — and the decision can be dropped
const product = await prisma.product.findUnique({ where: { slug } });
if (product?.status !== 'PUBLISHED') return null;

// yes: the constraint is part of the query
export function getPublishedProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: 'PUBLISHED' },
    // explicit select, so a column added later never leaks by default
    select: { id: true, slug: true, name: true, description: true },
  });
}
```

```ts
// no: a new client on every hot reload exhausts the connection pool
export const prisma = new PrismaClient();

// yes
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Anti-patterns

- A page or route handler writing its own `where` clause for product status, duplicating a rule that must hold everywhere.
- `prisma db push` on a migrated schema, leaving the committed history unable to rebuild the database it describes.
- Returning a full user row from a query and trusting later code to strip the password hash before serialising it.
- A seed that creates fresh records on each run, so fixture slugs shift and end-to-end assertions drift out of date.
- Throwing an error for a draft product, which distinguishes it from a nonexistent one to anyone watching the response.
