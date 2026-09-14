## 1. Configuration

- [ ] 1.1 Add `src/lib/env.ts` reading `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV` and validating them with Zod, throwing at startup with the variable's name when one is missing
- [ ] 1.2 Confirm `src/lib/env.ts` is imported only from server modules, never from a file carrying `'use client'`

## 2. Auth core

- [ ] 2.1 Add `src/lib/auth/password.ts` wrapping bcryptjs hash and verify
- [ ] 2.2 Add `src/lib/auth/session.ts` signing and verifying the session token with `jose`, using a two-hour expiry and the payload `{ sub, email }`
- [ ] 2.3 Add cookie helpers setting `pcs_session` httpOnly, `SameSite=Lax`, `Secure` when `NODE_ENV` is production, `Path=/`, and clearing it on sign-out
- [ ] 2.4 Add `requireAdmin(request)` returning the administrator's identity or a typed unauthorised result, with no throw for the ordinary signed-out case
- [ ] 2.5 Add `verifyCredentials(email, password)` that compares against a dummy hash when no account matches, so an unknown email and a wrong password cost comparable time

## 3. API

- [ ] 3.1 Add `src/lib/api/errors.ts` producing the shared error envelope, with `UNAUTHORIZED` and `VALIDATION_ERROR` codes
- [ ] 3.2 Add `POST /api/admin/login` validating the body with Zod, refusing with one generic 401 for both wrong password and unknown email
- [ ] 3.3 Add `POST /api/admin/logout` clearing the cookie and answering 204
- [ ] 3.4 Add `GET /api/admin/me` returning `{ email }` only, selected explicitly so no hash can ride along
- [ ] 3.5 Call `requireAdmin` explicitly at the top of every `/api/admin/**` handler, not relying on middleware

## 4. Guard

- [ ] 4.1 Add `middleware.ts` matching `/admin/:path*` and `/api/admin/:path*`, bypassing `/admin/login` and `/api/admin/login`
- [ ] 4.2 Redirect page requests to sign-in; answer API requests with 401 JSON rather than a redirect
- [ ] 4.3 Treat a tampered or expired token exactly as a missing one

## 5. Interface

- [ ] 5.1 Add the TanStack Query provider on the admin layout, creating the client inside `useState` so it is never shared across requests
- [ ] 5.2 Add `/admin/login` with an MUI form, submitting through `useMutation`, disabling the button while pending and keeping typed values on failure
- [ ] 5.3 Show the server's refusal message without revealing which field was wrong
- [ ] 5.4 Add the placeholder `/admin` landing page with a sign-out control, to be replaced by the product list in `add-product-editing`
- [ ] 5.5 Check both screens at a mobile width, since responsive layout is graded

## 6. Tests

- [ ] 6.1 Jest — password hash and verify round-trip, and that a wrong password fails
- [ ] 6.2 Jest — token sign and verify round-trip, and that a tampered signature and an expired token both fail
- [ ] 6.3 Jest — `requireAdmin` for no cookie, a valid cookie, and a malformed cookie
- [ ] 6.4 Jest — `verifyCredentials` refuses an unknown email and a wrong password identically
- [ ] 6.5 Cypress — signing in with the seeded credentials reaches the admin area; a wrong password shows an error and stays on the sign-in screen
- [ ] 6.6 Cypress — a signed-out visit to an admin page redirects, and `cy.request` to an admin endpoint returns 401 with code `UNAUTHORIZED`
- [ ] 6.7 Cypress — after signing out, the admin area and the admin endpoint are closed again
- [ ] 6.8 Cypress — the session cookie is absent from `document.cookie`, and `/api/admin/me` carries no password hash

## 7. Documentation and close out

- [ ] 7.1 Record for the README: the reviewer's sign-in credentials, and the known limitations — no revocation before expiry, no CSRF token, no rate limiting — with the reasoning from design.md
- [ ] 7.2 Run `npm run typecheck && npm run lint && npm test` clean
- [ ] 7.3 Run `npm run db:reset && npm run e2e` clean
- [ ] 7.4 Run `npm run spec:validate`
- [ ] 7.5 Archive the change, write the generated spec's Purpose, and act on what the docs-sync hook reports
