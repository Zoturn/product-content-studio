## Context

This change turns an empty schema into the starting state everything else assumes: a product an
administrator can edit, an account to edit it as, and a public identifier the catalog can link to.
It is also the first thing a reviewer executes, so its failure mode is "the README did not work",
which costs more than any single feature.

## Goals / Non-Goals

**Goals:** a data model that both the editor and the public pages can read; a seed that produces
the same state every time it runs; persistence that survives a restart; defence in depth on field
lengths.

**Non-Goals:** creating or deleting products, authentication behaviour, any HTTP surface, and any
user interface. Those belong to later changes and are specified there.

## Decisions

### A slug is the public identifier, not the database id

Public URLs use a human-readable slug (`wireless-mouse`), stored unique and never rewritten when
content changes. It keeps shared links stable and keeps URLs legible, which matters for a feature
whose point is SEO.

_Alternatives:_ exposing the primary key, which leaks storage detail into the URL and reads badly
in a page whose purpose is search presentation; a numeric autoincrement id, which additionally
tells any visitor how many products exist and lets them enumerate drafts by guessing.

### Characteristics are a JSON column, not their own table

The brief treats characteristics as read-only reference data displayed alongside the product. A
JSON column stores them without inventing a schema for something nothing in scope queries or
filters.

_Alternatives:_ a key/value attributes table, which is the right answer the moment you need to
filter or facet by attribute, and pure overhead until then; fixed columns, which cannot represent
products with different attribute sets.

_Caveat:_ the database will not validate the shape. Nothing in scope writes it — the seed is the
only producer, and the editor treats it as read-only — so the exposure is contained.

### Field lengths are declared in the database as well as in the validator

`description`, `seoTitle` and `seoDescription` carry `@db.VarChar` limits matching the validation
rules the editor will enforce.

_Alternatives:_ validating only in the application, which is a single point of failure — the
requirement is explicitly that invalid data must not be saved "including through direct API
requests", and one forgotten `safeParse` would defeat it. The validator still runs first, so
ordinary callers get a structured field error rather than a database exception; the column limit
exists to catch the path where it did not.

### Passwords are hashed with bcryptjs

_Alternatives:_ `bcrypt`, which is faster but compiles a native addon and so fails differently on
a reviewer's machine than on ours — a reproducibility risk that outweighs the speed for one login;
Argon2, stronger but with the same native-build problem.

### The seed upserts on a natural key

Each product is upserted by slug and the administrator by email, so re-running the seed converges
instead of duplicating or failing.

_Alternatives:_ delete-everything-then-insert, which is destructive if ever pointed at the wrong
database; plain inserts, which fail on the second run and make `migrate reset` awkward.

### The seeded password comes from configuration

The seed reads `ADMIN_PASSWORD` and hashes it at run time.

_Alternatives:_ committing a hash, which publishes a crackable artifact and pins the credential
forever; a hardcoded plaintext, which is the thing the brief explicitly grades against.

## Risks / Trade-offs

- **The fixed slugs become a test contract.** → Intended. The end-to-end suite asserts against
  known seed data; if someone renames a seeded product, those specs should fail loudly rather than
  quietly assert nothing.
- **The reviewer's credentials live in `.env`.** → `.env.example` documents them and the README
  states them plainly. They are development credentials for a local database by design.
- **JSON characteristics are unvalidated.** → Accepted, and bounded by the editor treating the
  field as read-only. If a later change makes them editable, they need a schema first.

## Migration Plan

This is the first migration, so there is nothing to migrate from. `npm run db:reset` drops and
recreates, then reseeds, and is the documented way to return to a known state before an end-to-end
run.

## Open Questions

None blocking. Whether characteristics eventually deserve their own table is a question for the
first feature that needs to query them, and nothing in this brief does.
