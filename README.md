# Product Content Studio

A small product-card editor for an online store, built as a full-stack take-home task. An
administrator signs in, edits a product's description and SEO fields, and moves it between draft
and published. Visitors browse a catalogue of published products and open their pages.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · MUI · TanStack Query · Prisma 6 ·
PostgreSQL · Zod · Jest · Cypress · npm

## Setup

Requires Node 22+, npm, and Docker (for PostgreSQL).

```bash
npm install
cp .env.example .env
# Generate your own JWT_SECRET before running anything you care about:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# paste the result into .env as JWT_SECRET

npm run db:up          # starts PostgreSQL in Docker
npm run db:migrate      # applies the schema
npm run db:seed         # one admin + three products (two published, one draft)
npm run dev              # http://localhost:3000
```

### Sign in

The admin area is at `/admin/login`. The seeded credentials (documented in `.env.example`, not a
secret worth protecting in a take-home):

```
email:    admin@example.com
password: ChangeMe123!
```

The public catalogue is at `/` — no sign-in needed.

## Commands

```bash
npm run typecheck
npm run lint
npm test                          # Jest
npm run db:reset && npm run e2e   # Cypress, against a freshly seeded database
npm run build
npm run spec:validate             # validates the OpenSpec change history
```

## Architecture

A single Next.js application, no separate backend service — Route Handlers under `src/app/api/**`
are the REST surface the brief asks for. Layout:

```
src/app/(public)          catalogue and product pages — Server Components, no client fetching
src/app/admin              the editor, behind the session cookie
src/app/api/admin/**        admin REST endpoints — every one calls requireAdmin() itself
src/app/api/public/**       public REST endpoints — no session, published-only
src/lib/services/products.ts  every Prisma product query, including the single published-only
                               choke point every public caller goes through
src/lib/validation/**       Zod schemas shared by the client forms and the server handlers
prisma/                      schema, migrations, deterministic seed
cypress/                     end-to-end specs
openspec/                    the four change proposals this project was built from, and the specs
                              they produced
.claude/                     rules and hooks that held the AI-assisted parts of this build to the
                              project's own conventions — see AI-WORKLOG.md
```

### Key decisions

- **Auth is a stateless JWT in an httpOnly cookie**, not a session table — there is exactly one
  administrator, who never changes, and no requirement to revoke or enumerate sessions. Verified
  twice per admin request: once by `middleware.ts` as a coarse gate, and again explicitly inside
  every `/api/admin/**` handler, so authorization never depends on a matcher pattern being correct.
- **Signing in survives a visit to the public side.** An administrator who leaves `/admin` to browse
  the public catalogue is not signed out, and returning to `/admin` finds them still signed in. The
  session is an httpOnly cookie with a fixed two-hour lifetime; the public pages never read it,
  never refresh it, and never clear it. Nothing about the catalogue is affected by whether a session
  exists — it renders identically for an administrator and a stranger — so the two sides of the app
  can be used in one browser without interfering with each other. Signing out is the explicit
  control in the admin area, and nothing else ends a session early.
- **Validation is one Zod schema**, imported by both the editor's form and the route handler that
  actually enforces it — the brief requires invalid data be rejected even from a direct API call,
  so the server-side check is the real gate and the client-side one is UX only.
- **The published-only read is one function**, `getPublishedProductBySlug`, called by the product
  page, its `generateMetadata`, and the public API alike. The status constraint is inside the
  Prisma query (`findFirst({ where: { slug, status: 'PUBLISHED' } })`), not a check applied after a
  plain lookup — so there is no code path that fetches a draft and then decides what to do with it.
  A draft and a nonexistent slug return byte-identical 404s from both the page and the API.
- **Public pages are Server Components rendered per request** (`force-dynamic`), reading the
  service layer directly — no client-side fetching, no caching. A product the admin has just
  unpublished disappears immediately rather than staying visible for an ISR window; this is the
  brief's "status controls public availability" holding at all times, not a performance trade-off.
- **The admin side uses TanStack Query** for fetch and mutation state — it has no SEO requirement
  to trade away, and gets a shared cache between the list and the editor in return.
- **Product content renders as a React text child**, never `dangerouslySetInnerHTML`, with
  `whiteSpace: 'pre-wrap'` for line breaks instead of converting `\n` to `<br>`. React escapes text
  nodes automatically, so a `<script>` tag typed into the description renders as visible text and
  never executes.

## Testing

Jest for logic and services (validation schemas, auth helpers, the service layer with Prisma
mocked) — fast, no boundary to cross. Cypress for everything that crosses one: HTTP behaviour via
`cy.request`, and full user flows through a real browser. Both are fully offline — no external
service, no API key, and Cypress runs against a database reset and reseeded immediately beforehand
(`npm run db:reset`), so every assertion starts from the same known fixtures.

One deliberate exception to that split: `src/app/api/admin/products/[id]/route.spec.ts` unit-tests
a route handler, which would normally be Cypress's job. It exists because the thing being tested
is invisible over HTTP. Admin routes are guarded twice — by `middleware.ts` and by a `requireAdmin()`
call inside each handler — and the middleware answers every unauthenticated request before the
handler runs, so removing the in-handler guard leaves the entire end-to-end suite green. That spec
calls the handlers directly, with no middleware in the path, and asserts they refuse on their own
and never reach the data layer.

**Actual results**, from a clean `db:reset`:

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm test` — 67 passed, 67 total
- `npm run e2e` — 31 passed, 31 total (9 spec files: auth, access control, session-cookie
  security, product editing via the UI and directly against the API, the admin product list, the
  public catalogue, the public product page, and draft gating)
- `npm run build` — clean; the built client bundle was grepped for `JWT_SECRET`, `ADMIN_PASSWORD`
  and the database URL after every change that touched auth or configuration, and none appeared

## Known limitations

Recorded as design decisions during the build rather than left for a reader to discover:

- **A JWT cannot be revoked before it expires.** Sign-out clears the cookie, which ends the
  session in practice for whoever signs out, but a token copied elsewhere stays valid until its
  two-hour expiry. Bounded by that short lifetime and there being a single trusted administrator.
- **No CSRF token.** `SameSite=Lax` on the session cookie keeps it off cross-site POSTs, and
  nothing cross-origin is configured to call the API. Stated here rather than adding a token
  system that would only be defending against a caller this app doesn't accept traffic from.
- **No rate limiting on sign-in.** Out of scope per the brief, and the intended deployment is a
  reviewer's local machine, not a public endpoint.
- **The browser's own back button bypasses the unsaved-changes warning.** `beforeunload` covers
  reload and tab close; the editor's own "back to products" control asks for confirmation before
  navigating. Neither is a route-change guard, because the App Router has no supported API for
  one — the available workarounds patch the router or monkey-patch browser history, which breaks
  quietly on a framework upgrade. The two paths a user is most likely to take are both covered.
- **No protection against two people editing the same product at once.** There is exactly one
  administrator account and no requirement for concurrent editing; adding version checks would be
  solving a problem this brief doesn't have.
- **No pagination or search in either the admin list or the public catalogue.** Fine for three
  seeded products; the first thing to add if this ever serves a real catalogue.
- **Two accepted vulnerable build-time dependencies**, neither in a code path a request reaches:
  `deepmerge-ts` (via the Prisma CLI's own config loader) and `postcss` (bundled inside Next).
  `npm audit` summarises this as "5 vulnerabilities" because it also counts the dependents that
  pull them in — `deepmerge-ts` → `@prisma/config` → `prisma`, and `postcss` → `next`. Two
  packages, five flagged entries. Both proposed fixes are downgrades — to Prisma 6.12.0 and to Next 16 respectively — that
  were deliberately rejected elsewhere in this project for stability and AI-tooling-compatibility
  reasons (see `AI-WORKLOG.md`). Chasing them would mean re-introducing problems already solved.

## Docker

`docker compose up -d` starts PostgreSQL only — `npm run dev` runs natively against it, which is
the everyday loop. `docker compose --profile full up --build` additionally builds and runs the
whole application in a container, verified working end-to-end (catalogue, public API, and admin
sign-in all tested against the containerized database) as this project's attempt at the optional
Infrastructure bonus.

## AI usage

Built with Claude Code (Claude Opus 5 for design work — OpenSpec proposals, specs and design
docs; Claude Sonnet 5 for implementation). The full account — tools, the split between generated
and directed work, and concrete examples of AI-code decisions with how they were verified — is in
`AI-WORKLOG.md`.

## Time spent

Approximately 9 hours, as tracked by the candidate. All four planned OpenSpec changes shipped, plus
a fifth added after manual testing (a way back to the catalogue from a product page). No bonus was
attempted beyond the Docker Compose "full" profile above.
