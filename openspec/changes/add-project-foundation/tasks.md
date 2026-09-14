## 1. Data model

- [ ] 1.1 Add the `ProductStatus` enum with `DRAFT` and `PUBLISHED`, defaulting to `DRAFT`
- [ ] 1.2 Add the `Product` model: id, unique `slug`, `name`, `attributes` as Json, `description` VarChar(1000), `seoTitle` VarChar(60), `seoDescription` VarChar(160), `status`, timestamps
- [ ] 1.3 Add the `AdminUser` model: id, unique `email`, `passwordHash`, timestamps
- [ ] 1.4 Index `status`, since every public read filters on it
- [ ] 1.5 Generate and run the first migration, and commit it with the schema change

## 2. Prisma client

- [ ] 2.1 Add `src/lib/prisma.ts` exporting one client, cached on `globalThis` in development so hot reloads reuse the connection pool
- [ ] 2.2 Confirm the client is never imported from a file carrying `'use client'`

## 3. Seed

- [ ] 3.1 Add `prisma/seed.ts` reading `ADMIN_EMAIL` and `ADMIN_PASSWORD`, failing fast with a clear message when either is unset
- [ ] 3.2 Upsert the administrator by email, storing only a bcryptjs hash generated at run time
- [ ] 3.3 Upsert three products by fixed slug: `wireless-mouse` and `mechanical-keyboard` published, `smart-desk-lamp` draft, each with realistic characteristics, description and SEO fields
- [ ] 3.4 Verify the seed is idempotent by running it twice and confirming counts are unchanged

## 4. Tests

- [ ] 4.1 Jest — the seed's product fixtures satisfy the editor's length limits, so the starting state is not itself invalid
- [ ] 4.2 Jest — the Prisma client module exports a single instance rather than constructing a new one per import
- [ ] 4.3 Confirm `npm test` passes offline with no database running, since these are unit tests

## 5. Documentation and close out

- [ ] 5.1 Update the change table in `CLAUDE.md` so row 1 describes the data layer this change actually delivers
- [ ] 5.2 Record the seeded credentials and the `db:up` / `db:migrate` / `db:seed` sequence for the README, which `add-public-catalog` assembles
- [ ] 5.3 Run `npm run typecheck && npm run lint && npm test` clean
- [ ] 5.4 Run `npm run spec:validate`
- [ ] 5.5 Archive the change and act on everything the docs-sync hook reports, including writing the generated spec's Purpose
