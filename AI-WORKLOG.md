# AI-WORKLOG

## Tools and models

Claude Code, using two models for two different parts of the work: **Claude Opus 5** for design —
the OpenSpec proposals, delta specs, and design documents for all four changes — and **Claude
Sonnet 5** for implementation once a design was approved. I switched deliberately at each
design→execution boundary: design work benefits from the larger reasoning budget, and mechanical
implementation against an already-settled design doesn't need it.

My own contribution was the direction, not the keystrokes: the scope and sequencing of the four
changes, every stack and architecture decision the assistant proposed as options, the two
clarifying-question rounds where I picked between real alternatives (session vs. token auth,
SQLite vs. Postgres, editor UX polish level, status-toggle location), reviewing every proposed
commit before it landed, and — critically — asking for a full-project `/code-review` and
`/simplify` pass rather than accepting the feature as "done" once its own tests passed. That pass
is where several of the bugs below were actually found.

## What the automated tests did and didn't catch

Both the application code and its tests were written by the same assistant in the same session, so
I want to be direct about what that does and doesn't prove. Tests the assistant writes for code the
assistant just wrote are correlated failures waiting to happen — a wrong assumption baked into the
implementation tends to be baked into the test that "verifies" it the same way, and a passing suite
in that situation is weaker evidence than it looks.

What actually caught the real bugs in this project was not the first-pass test suite passing — it
was:

- **Running things live**, against a real server and a real browser, rather than trusting a test's
  green checkmark. The middleware bug below was found this way, before any Cypress test touched it.
- **A second, independent review pass** — `/code-review` plus `/simplify` run across the whole
  project, not just the diff — using different reasoning angles (correctness, reuse, efficiency,
  altitude, convention compliance) than whatever produced the original code. This is what actually
  surfaced the `isDirty` and case-sensitive-login bugs, both of which had shipped with passing tests.
- **Testing a suggestion instead of applying it.** The one case where I have direct evidence of the
  process working as a check, not just a rubber stamp, is the `theme.ts` finding below — a plausible
  cleanup that was empirically wrong, caught because it was tested instead of trusted.

## Concrete examples

### 1. `middleware.ts` silently never ran

While building admin authentication, the assistant wrote `middleware.ts` at the project root. The
build succeeded, the code looked correct, and nothing raised an error — but Next.js with a `src/`
layout expects middleware at `src/middleware.ts`, and at the root it is simply never registered, no
warning given. This was caught by checking the build output's `.next/server/middleware-manifest.json`
for an actual entry rather than assuming a clean build meant a working guard — a habit adopted
specifically because "no errors" is not the same claim as "does what I think it does." The
`requireAdmin()` check inside every API route handler (defence-in-depth, independent of the
middleware) meant no admin data was ever actually exposed by the gap — but the page-level redirect
for signed-out visitors was missing the entire time it went undetected.
See `feat(auth): add sign-in/out, JWT session cookie, and the admin guard`.

### 2. A test that was flaky for a genuinely subtle reason

A Cypress test tampered with a JWT by flipping its last character and asserting the token then
failed verification. It passed most of the time and failed occasionally. The cause: a 256-bit HMAC
signature doesn't divide evenly into base64's 3-byte encoding groups, so the _final_ character of
the signature carries mostly zero-padding rather than real signature bits — flipping it can decode
to the exact same bytes, leaving the "tampered" token still valid. I had the assistant explain the
failure rather than just re-run the test until it passed, since a flaky security test is worse than
a slow one — it erodes trust in the whole suite. The fix flips a character in the middle of the
signature instead, confirmed deterministic over ten repeated runs.
See `feat(auth): add sign-in/out, JWT session cookie, and the admin guard`.

### 3. Two real bugs found only by a dedicated review pass, not the feature's own tests

After the product editor shipped with 45 Jest tests and 17 Cypress tests passing, I asked for
`/code-review` and `/simplify` run across the _entire_ project rather than just what had changed.
Eight parallel review angles found, among other things, two genuine bugs that the feature's own
test suite had not caught because nobody had written a test for the specific failure mode:

- The editor never reset its "unsaved changes" tracking after a **successful** save, so the
  leave-without-saving warning fired even immediately after saving — a false positive on exactly
  the UX guarantee the feature was supposed to provide.
- Admin login compared the submitted email case-sensitively with no normalization, so a browser
  autofill or mobile keyboard that capitalized the first letter would reject a correct password as
  "incorrect credentials."

Both were fixed, and — this part matters as much as finding them — I had the assistant write a
regression test for each _after_ the fix, specifically because the absence of such a test is what
let the bug ship the first time.
See `feat(products): add the admin product list and editor`.

### 4. A plausible-looking suggestion that was empirically wrong

The same review pass flagged `theme.ts`'s `'use client'` directive as unnecessary overhead. I asked
the assistant to verify rather than apply it on the review's say-so. It removed the directive, ran a
real production build, and the build failed immediately: a MUI theme object carries functions
(`breakpoints.up`, etc.), and Next.js's Server-to-Client component boundary cannot pass a function as
a prop. The directive is load-bearing, not redundant. This is the example I'd point to for "how was
AI-generated code (here, an AI-generated _suggestion about_ code) actually checked": not by asking a
second model whether it sounded right, but by running it and watching it fail.
See `feat(products): add the admin product list and editor`.

### 5. The Docker "full" profile build failed on the first real attempt

Before writing this file, I had the assistant actually run `docker compose --profile full up
--build` rather than describe the setup as working because the Dockerfile looked complete. It
failed: Next.js's build step imports every route module to collect its page data, which imports the
app's typed environment module, which validates `DATABASE_URL`/`JWT_SECRET` at import time — and the
Docker build stage had neither set. The fix adds build-time placeholder values (the container still
receives the real values at runtime, since the environment module re-validates on every process
start, not just once at build time). Confirmed working end-to-end afterward: catalogue, public API,
and admin sign-in all tested against the fully containerized stack.

## Where I'd push back if I were reviewing this

If I hadn't built it: the size of `.claude/rules/` and the OpenSpec workflow is more process than a
three-screen CRUD app strictly needs, and I'd ask whether it was worth the time against the 6–8
hour target. My answer is that the brief grades _deliberate_ AI tool usage specifically, and a repo
that shows specs before code, rules constraining what the assistant could do, and hooks enforcing
test coverage is itself the evidence for that criterion — not overhead alongside it. Whether that
trade was the right one is a fair thing to disagree with.
