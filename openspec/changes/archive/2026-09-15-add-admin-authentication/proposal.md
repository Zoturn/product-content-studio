## Why

There is a seeded administrator but no way to become one, and nothing yet distinguishes an
administrator from a stranger. Every later change writes admin-only behaviour, so the boundary
those changes depend on has to exist and be enforced first.

The brief is specific about the shape of that boundary: administrative data and operations must be
unreachable without authorisation, explicitly including direct calls to the API rather than only
through the interface. That phrasing rules out a guard that lives solely in the user interface, and
it makes the failure path — the unauthorised request — the thing worth specifying.

## What Changes

- A sign-in screen that exchanges the seeded email and password for a session.
- A session carried in an httpOnly cookie, signed and short-lived, verified on every admin request.
- A guard in two layers: middleware covering the admin routes, and an explicit check inside each
  admin endpoint, so authorisation does not depend on a matcher pattern being written correctly.
- Sign-out, which clears the session and closes the area again.
- A placeholder admin landing page with sign-out, replaced by the product list in the next change.
- `src/lib/env.ts`, the single typed place configuration is read, introduced here because this is
  the first change whose runtime code needs a secret.

## Capabilities

### New Capabilities

- `admin-authentication`: who may reach the administrative area, how they prove it, how that proof is carried and ended, and what an unauthorised caller is told.

### Modified Capabilities

None. This change adds a boundary rather than altering existing behaviour.

## Impact

- Every admin route added later inherits the guard, and is expected to call it explicitly rather
  than rely on the middleware alone.
- Introduces the first Cypress specs. They run against the seeded fixtures from
  `platform-foundation`, so that change's determinism guarantee is now load-bearing for the suite.
- A signed-out response shape is fixed here: pages redirect, API calls receive the error envelope
  with `UNAUTHORIZED`. Later endpoints follow it rather than inventing their own.
