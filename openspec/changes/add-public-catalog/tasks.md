## 1. Service layer

- [ ] 1.1 Add `getPublishedProducts()` returning slug, name and whatever the catalogue card shows, filtered to published in the query
- [ ] 1.2 Add `getPublishedProductBySlug(slug)` as `findFirst({ where: { slug, status: 'PUBLISHED' } })`, returning `null` for a draft and for an unknown slug alike
- [ ] 1.3 Use explicit `select` in both, so a column added later cannot leak into a public response by default
- [ ] 1.4 Confirm no page, route handler or component writes its own status filter — the two helpers above are the only published-only reads

## 2. Public API

- [ ] 2.1 Add `GET /api/public/products` returning published products only, with no session required
- [ ] 2.2 Add `GET /api/public/products/[slug]` returning one published product, awaiting `params`
- [ ] 2.3 Answer a draft and an unknown slug with the same `NOT_FOUND` envelope and status
- [ ] 2.4 Confirm the middleware matcher does not cover `/api/public/**`, so these stay reachable without a cookie

## 3. Catalogue

- [ ] 3.1 Replace the scaffold's `src/app/page.tsx` with the catalogue, reading through `getPublishedProducts()`
- [ ] 3.2 Link each product to `/products/[slug]`
- [ ] 3.3 Render an empty state when nothing is published, rather than an empty page or a crash
- [ ] 3.4 Render per request rather than cached, so an unpublished product disappears immediately

## 4. Product page

- [ ] 4.1 Add `/products/[slug]` reading through `getPublishedProductBySlug()`, awaiting `params`
- [ ] 4.2 Call `notFound()` when the helper returns `null`, so a draft and an unknown slug are indistinguishable
- [ ] 4.3 Show the name and characteristics, and the description as a text child with `whiteSpace: 'pre-wrap'`
- [ ] 4.4 Add `generateMetadata` reading through the same helper, setting title and description from the SEO fields
- [ ] 4.5 Render per request, matching the catalogue
- [ ] 4.6 Check the catalogue and product page at a mobile width

## 5. Tests

- [ ] 5.1 Jest — `getPublishedProducts` excludes drafts, with Prisma mocked
- [ ] 5.2 Jest — `getPublishedProductBySlug` returns `null` for a draft slug and for an unknown slug, and puts the status in the query rather than checking afterwards
- [ ] 5.3 Cypress — the catalogue lists both seeded published products and does not mention the seeded draft
- [ ] 5.4 Cypress — a published product's page shows its name, characteristics and description
- [ ] 5.5 Cypress — the seeded draft's URL returns a 404 page, and `cy.request` to its public API URL returns 404 matching an unknown slug's response
- [ ] 5.6 Cypress — the document title and meta description match the product's saved SEO fields
- [ ] 5.7 Cypress — a description containing a script payload renders as visible text and executes nothing
- [ ] 5.8 Cypress — unpublishing a product in the editor removes it from the catalogue and 404s its page on the next request
- [ ] 5.9 Cypress — the catalogue, a product page and the public API all work with no session cookie

## 6. Documentation

- [ ] 6.1 Write `README.md`: what the project is, the stack, and setup from a clean clone — env vars, `db:up`, `db:migrate`, `db:seed`, `dev` — with the reviewer's sign-in credentials
- [ ] 6.2 Document how to run both suites, and why the testing strategy is split the way it is
- [ ] 6.3 Record the actual results of the checks, the known limitations gathered from all four changes' design documents, and the time spent
- [ ] 6.4 Note the two accepted npm-audit advisories and why chasing them would mean downgrading deliberately chosen versions
- [ ] 6.5 Draft `AI-WORKLOG.md`: tools and models used, the split between what the assistant produced and what was directed, and the role the automated tests played in verifying generated code
- [ ] 6.6 Cite 2–3 concrete examples with their commits — the unregistered middleware, the flaky JWT tamper test, the full-project review's `isDirty` and case-sensitive-login findings, and the `theme.ts` suggestion that testing disproved
- [ ] 6.7 Update the change table in `CLAUDE.md` so row 4 describes what shipped

## 7. Close out

- [ ] 7.1 Run `npm run typecheck && npm run lint && npm test` clean
- [ ] 7.2 Run `npm run db:reset && npm run e2e` clean
- [ ] 7.3 Run `npm run build` and confirm no secret appears in the client bundle
- [ ] 7.4 Run `npm run spec:validate`
- [ ] 7.5 Archive the change, write the generated spec's Purpose, and act on what the docs-sync hook reports
- [ ] 7.6 Final pass: confirm `CLAUDE.md`, every rule and every archived spec describe the system as it actually shipped
