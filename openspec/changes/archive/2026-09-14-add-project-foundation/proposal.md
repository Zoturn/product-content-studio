## Why

The repository has tooling but no data. Nothing can be built on it yet: there is no product to
edit, no administrator to sign in as, and no way for a reviewer to reach a running system holding
representative content.

The brief requires that, after following the README on a clean machine, a test administrator and
three demonstration products exist — among them at least one draft and one published — and that
saved content survives a restart. That is behaviour a reviewer will check, not an incidental setup
detail, so it belongs in a spec rather than in prose.

## What Changes

- A `Product` model carrying what the editor and the public pages both need: a stable public slug,
  a read-only name and characteristics, the three editable content fields, and a status.
- An `AdminUser` model holding the single seeded account, storing only a password hash.
- The first migration, committed alongside the schema it came from.
- A deterministic, idempotent seed creating exactly one administrator and three products — two
  published, one draft — at fixed slugs the end-to-end suite can assert against.
- One shared Prisma client, so repeated hot reloads in development cannot exhaust the connection
  pool.

## Capabilities

### New Capabilities

- `platform-foundation`: the persistent data model, the seeded starting state a reviewer receives, and the guarantee that saved content outlives the process.

### Modified Capabilities

None. This is the first change.

## Impact

- Creates `prisma/migrations/`. Later changes add migrations rather than editing existing ones.
- Field lengths in the schema mirror the limits the editor will enforce, so an oversized value is
  refused at two independent layers instead of being silently truncated at one.
- The fixed seed slugs become a contract the Cypress suite depends on; changing one later is
  intended to break those specs loudly.
