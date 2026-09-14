## Context

This change draws the only trust boundary in the application. Everything after it — the product
list, the editor, every admin endpoint — assumes the boundary holds, so a weakness here is not
contained to this change. The brief also states the requirement in its strong form: admin data and
operations must be unreachable without authorisation _including through direct API requests_, which
means the interface cannot be where the rule lives.

## Goals / Non-Goals

**Goals:** sign in and out; a session that cannot be forged or read by page scripts; a guard that
holds for direct API calls; a refusal that leaks nothing about which accounts exist.

**Non-Goals:** registration, password reset, roles or permissions, multiple administrators, rate
limiting, and remember-me. The brief places all of these out of scope, and each would add a surface
this application has no requirement to defend.

## Decisions

### A stateless signed token, not a session table

The session is a signed JWT in a cookie, verified per request. There is exactly one administrator,
who never changes, and no requirement to enumerate or revoke sessions.

_Alternatives:_ a database session table, which buys server-side revocation at the cost of a schema,
a write on every sign-in, a lookup on every request and a cleanup job — real machinery to solve a
problem this application does not have. The cost of the choice is stated under Risks.

### `jose` rather than `jsonwebtoken`

Verification has to run in Next.js middleware, which executes on the Edge runtime, and again inside
route handlers on Node. `jose` runs on both with one code path.

_Alternatives:_ `jsonwebtoken`, which depends on Node built-ins and so cannot verify in middleware —
forcing either a second library or moving the guard entirely into handlers and losing the redirect
behaviour that page requests need.

### The guard is applied twice, deliberately

`middleware.ts` matches the admin paths, and every admin route handler additionally calls
`requireAdmin()` itself.

_Alternatives:_ middleware alone, which is one matcher pattern away from silently exposing an
endpoint — a route added later under a path the matcher does not cover is unprotected, and nothing
fails loudly to say so. Duplicating the check means the matcher is an optimisation rather than the
security control. It is also what makes the guard unit-testable without standing up HTTP.

### Pages redirect, endpoints return 401 JSON

The same missing session produces different responses depending on what asked.

_Alternatives:_ redirecting uniformly, which answers an API client with a 307 to an HTML page — a
response it cannot interpret, and one that turns a clear authorisation failure into a parse error.

### One refusal for both unknown email and wrong password

Both produce the same status and the same message. The verification also runs a bcrypt comparison
against a dummy hash when no account matches, so the two paths take comparable time.

_Alternatives:_ distinct messages, which are friendlier and tell an attacker which addresses are
real; or matching messages without the dummy comparison, which still separates the cases by
response time — a slower answer means the email existed and a hash was actually checked.

### Cookie flags: httpOnly, `SameSite=Lax`, `Secure` in production, two-hour lifetime

_Alternatives:_ `SameSite=Strict`, which would also work here as nothing links in from another
origin, but breaks the moment a link into the admin area is followed from elsewhere; a longer
lifetime, which widens the window in which a stolen token is useful and is the main mitigation for
having no revocation; storing the token in `localStorage`, which is readable by any script on the
page and is the standard way this goes wrong.

### Configuration is read in one typed module

`src/lib/env.ts` reads and validates the variables at startup and is the only place `process.env` is
touched by application code.

_Alternatives:_ reading `process.env.JWT_SECRET!` at each use, which trades a clear startup failure
for an obscure one — a missing secret would surface as a signing error inside a request, and a
non-null assertion would let the application start and sign tokens with `undefined`.

## Risks / Trade-offs

- **A token cannot be revoked before it expires.** → Accepted, and bounded by the two-hour lifetime
  and a single trusted user. Sign-out clears the cookie, which ends the session in practice for the
  person signing out; it does not invalidate a token already copied elsewhere. Stated in the README
  as a known limitation rather than left for a reader to discover.
- **No CSRF token.** → `SameSite=Lax` keeps the cookie off cross-site POSTs, and no cross-origin
  caller is configured. Adding a token system would be defensible, but claiming protection the code
  does not implement would be worse; the reasoning is documented instead.
- **No rate limiting on sign-in.** → Out of scope per the brief, and the deployment target is a
  local reviewer's machine. Worth naming in the README rather than silently omitting.
- **The dummy comparison is an approximation.** → It equalises the dominant cost, not every branch.
  It defeats a casual timing probe, which is the realistic threat at this scale.

## Migration Plan

Nothing to migrate: the administrator already exists from `platform-foundation`, and this change
adds no columns. Reviewers use the credentials in `.env`, and `npm run db:reset` restores them.

## Open Questions

None blocking. Whether revocation is worth a session table is a question for the first requirement
that needs it — multiple administrators, or forced sign-out — and this brief has neither.
