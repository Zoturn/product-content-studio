# Tasks

## 1. The return control

- [ ] 1.1 Add a link on `/products/[slug]` to `/`, using `next/link` so it is a real navigation and
      works without JavaScript
- [ ] 1.2 Style it with MUI to match the admin editor's existing "← Back to products" control, so
      the two sides of the app do not each invent their own affordance
- [ ] 1.3 Keep the page a Server Component — this is a link, not interactivity, and must not drag
      the product page across the client boundary

## 2. Tests

- [ ] 2.1 Extend `cypress/e2e/public-product-page.cy.ts` with the round trip: open the catalogue,
      follow a product link, use the return control, assert the catalogue is shown
- [ ] 2.2 Cover the direct-URL case, where there is no browser history to fall back on
- [ ] 2.3 Confirm the whole suite still passes against a freshly reset database

## 3. Documentation

- [ ] 3.1 Note in `README.md` that an administrator browsing the public catalogue is not signed out
      — the session cookie is httpOnly with a fixed TTL and the public pages ignore it entirely, so
      returning to `/admin` still finds them signed in. This is the existing "The public side
      requires no session" requirement seen from the user's side, and it surprised a tester
- [ ] 3.2 Update the recorded test counts if they changed

## 4. Close out

- [ ] 4.1 `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
- [ ] 4.2 `npm run db:reset && npm run e2e`
- [ ] 4.3 `npm run spec:validate`
- [ ] 4.4 Archive the change and act on what the docs-sync hook reports
