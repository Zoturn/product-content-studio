## Why

The administrator can sign in but has nothing to do once inside. This change is the product the
brief is actually about: editing a product's description and SEO fields and moving it between draft
and published.

It also carries the requirement most likely to be probed by whoever reviews this. The brief states
the content limits and then adds that invalid data must not be saved _including through direct
requests to the API_ — which makes the form's validation a convenience and the server's validation
the actual rule. Everything here is arranged so that the two cannot disagree.

## What Changes

- A product list showing each product's name and status, opening any of them for editing.
- An editor for the four editable fields — description, SEO title, SEO description, status — with
  the name and characteristics shown as read-only text.
- A shared Zod schema enforcing the limits, imported by both the form and the route handler, with
  the field limits exported as constants so the character counters cannot drift from the rule.
- `GET /api/admin/products` and `GET`/`PATCH /api/admin/products/[id]`, each calling `requireAdmin`.
- A service layer in `src/lib/services/products.ts`, which `add-public-catalog` later extends with
  the published-only read path.
- Save on an explicit action only: a failed save keeps the user's edits and says why, and leaving
  with unsaved edits warns first.
- `/admin` becomes a redirect to the product list, replacing the placeholder page.

## Capabilities

### New Capabilities

- `product-editing`: what an administrator may change about a product, what they may not, the limits that apply, and what happens to their work when a save fails.

### Modified Capabilities

None. The admin boundary from `admin-authentication` is reused as-is; this change adds endpoints
behind it rather than altering how it works.

## Impact

- First use of the service layer, which `add-public-catalog` extends rather than replaces. The
  published-only read path is deliberately not written here, so it arrives with the requirement
  that needs it.
- Status becomes editable but has no visible public effect until `add-public-catalog` ships; this
  change only guarantees it is persisted and returned.
- The error envelope gains its first `fieldErrors` consumer, fixing the shape the editor and every
  later form rely on.
