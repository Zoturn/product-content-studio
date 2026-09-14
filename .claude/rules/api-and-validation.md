---
paths:
  - "src/app/api/**"
  - "src/lib/validation/**"
  - "src/lib/api/**"
---

# API contract and validation

**Scope:** Route handler behaviour, the shared Zod schemas, authorisation and the error envelope. It does not cover how forms present errors, which belongs to `ui-and-ux-states.md`.

## Rules

1. Define one Zod schema per payload in `src/lib/validation/` and import it in both the client form and the server handler, because a rule written twice will drift, and the copy that drifts is the one that stops protecting you.
2. Parse every request body with `safeParse` before touching the database, since the database is the thing being protected and anything validated after a write has already failed.
3. Treat client-side validation as user experience only and never as the gate — a direct HTTP request skips the form entirely, and the brief is graded on exactly that request.
4. Declare payload schemas `.strict()` so unknown keys are rejected rather than ignored, which turns an attempt to patch a read-only field such as `name` into a visible 400 instead of a silent no-op.
5. Return every non-2xx response in the shared envelope `{ error: { code, message, fieldErrors? } }`, because one predictable shape means the client has one error path rather than a guess per endpoint.
6. Return `fieldErrors` from Zod's `z.flattenError()` on validation failures, so the client can attach each message to the field that caused it instead of showing one vague banner.
7. Call `requireAdmin(request)` inside every `/api/admin/**` handler even though middleware also guards those paths, because defence in depth means authorisation does not depend on a matcher config being right.
8. Answer unauthenticated API calls with a 401 JSON body and never a redirect, since a fetch client follows the redirect and reads a login page as if it were data.
9. Return an identical 404 for a draft product and for a slug that does not exist, so the public API cannot be used to enumerate unpublished work by comparing responses.
10. Return one generic message on failed login that names neither the email nor the password as wrong, because a specific message confirms which accounts exist.
11. Enforce the documented limits in the schema — description required and at most 1000 characters, SEO title at most 60, SEO description at most 160 — and state the limit in the message so the user knows what to fix.
12. Set the session cookie `pcs_session` as httpOnly, sameSite lax and secure in production, because a token readable by scripts is a token any injected script can take.

## Examples

```ts
// no: trusting the client's shape, and a hand-rolled error body
const body = (await request.json()) as ProductUpdate;
if (!body.description) return NextResponse.json({ ok: false }, { status: 400 });

// yes: one shared schema, one envelope, field-level errors
const parsed = productUpdateSchema.safeParse(await request.json());
if (!parsed.success) {
  const error = {
    code: 'VALIDATION_ERROR',
    message: 'Some fields need attention.',
    fieldErrors: parsed.error.flatten().fieldErrors,
  };
  return NextResponse.json({ error }, { status: 400 });
}
```

```ts
// no: the route relies entirely on middleware having matched this path
export async function PATCH(request: NextRequest) {
  return update(await request.json());
}

// yes: the handler proves the caller is an admin itself
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
}
```

## Anti-patterns

- A second copy of the length limits inside a component, which quietly diverges from the schema the server enforces.
- A permissive schema that ignores unexpected keys, so a request to change a read-only field looks accepted.
- Distinct responses for a draft and a missing product, turning the public API into a directory of unpublished slugs.
- "No account with that email" on the login route, which confirms which addresses are registered.
- An admin route that checks authentication only when the request looks like it came from the app's own UI.
