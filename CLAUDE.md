# Product Content Studio

A small product-card editor for an online store. An admin signs in, edits a product's description
and SEO fields, and moves it between draft and published. Visitors browse a catalog of published
products and open their pages. Built for a full-stack take-home task.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · MUI · TanStack Query · Prisma ·
PostgreSQL · Zod · Jest · Cypress · npm

## Layout

```
src/app/            pages and the REST route handlers under src/app/api
src/components/     admin and public components
src/lib/            prisma client, auth, validation, product services
prisma/             schema, migrations, deterministic seed
cypress/            end-to-end specs
openspec/           change proposals and the specs they produce
.claude/rules/      the conventions this project is held to
.claude/hooks/      automation (see below)
```

Product name and characteristics are read-only everywhere. Creating and deleting products is out
of scope; the editor changes description, SEO fields and status only.

## Commands

```bash
npm install
cp .env.example .env         # then set JWT_SECRET
npm run db:up                # Postgres in Docker
npm run db:migrate
npm run db:seed              # one admin + three products
npm run dev

npm run typecheck
npm run lint
npm test                     # Jest
npm run db:reset && npm run e2e   # Cypress against a freshly seeded database
npm run spec:validate
```

## Working here

Changes start as an OpenSpec proposal, not as code. Read
[.claude/rules/openspec-workflow.md](.claude/rules/openspec-workflow.md) before starting anything.
Each change is archived before the next begins.

| Order | Change                            | Delivers                                                      |
| ----- | --------------------------------- | ------------------------------------------------------------- |
| 1     | `add-project-foundation`          | Product/AdminUser schema, first migration, deterministic seed |
| 2     | `add-admin-authentication`        | sign in and out, session cookie, guarded admin routes         |
| 3     | `add-product-editing`             | product list, editor, validation, admin REST endpoints        |
| 4     | `add-public-catalog`              | catalog, product page, SEO metadata, draft-gated public API   |
| 5     | `add-catalogue-return-navigation` | a way back to the catalogue from a product page               |

## Rules

| Rule                                                         | Covers                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [openspec-workflow.md](.claude/rules/openspec-workflow.md)   | proposing, specifying, applying and archiving a change       |
| [typescript.md](.claude/rules/typescript.md)                 | strictness, no `any`, types inferred from schemas            |
| [nextjs-app-router.md](.claude/rules/nextjs-app-router.md)   | server and client components, route handlers, metadata       |
| [prisma-data-model.md](.claude/rules/prisma-data-model.md)   | schema conventions, migrations, the published-only read path |
| [api-and-validation.md](.claude/rules/api-and-validation.md) | endpoint shapes, the error envelope, server-side enforcement |
| [data-fetching.md](.claude/rules/data-fetching.md)           | which side of the boundary a read belongs on                 |
| [ui-and-ux-states.md](.claude/rules/ui-and-ux-states.md)     | styling, responsiveness, loading, error and success states   |
| [testing.md](.claude/rules/testing.md)                       | what Jest covers, what Cypress covers, offline requirement   |
| [env-and-secrets.md](.claude/rules/env-and-secrets.md)       | configuration and what must never reach a browser            |

## Automation

Repeated actions are hooks in [.claude/settings.json](.claude/settings.json), never instructions in
a rule. They run whether or not anyone remembers them, and no-op in a clone with nothing installed.

| Hook                                                       | Fires                    | Does                                                     |
| ---------------------------------------------------------- | ------------------------ | -------------------------------------------------------- |
| [spec-guard.sh](.claude/hooks/spec-guard.sh)               | before a write           | refuses hand edits to generated `openspec/specs/**`      |
| [format.sh](.claude/hooks/format.sh)                       | after a write            | Prettier, using the project's own config                 |
| [test-companion.sh](.claude/hooks/test-companion.sh)       | after a source write     | reports a missing or stale companion spec                |
| [post-commit-tests.sh](.claude/hooks/post-commit-tests.sh) | after `git commit`       | runs Jest when the commit touched application code       |
| [docs-sync.sh](.claude/hooks/docs-sync.sh)                 | after `openspec archive` | revalidates specs, checks rule links and README sections |

## Testing

Jest for logic and services; Cypress for anything crossing an HTTP or browser boundary. Cypress
runs against a freshly reset and seeded database so fixtures are deterministic. Everything runs
offline — no external service, no API key. The detail is in
[.claude/rules/testing.md](.claude/rules/testing.md).

## Documentation

This file carries orientation and a rule index. Conventions, examples and detail go in a rule. If
something here starts explaining _how_ to do something, it belongs in a rule instead.
