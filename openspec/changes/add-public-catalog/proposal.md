## Why

Everything built so far is behind a sign-in. An administrator can edit a product and move it
between draft and published, but nothing yet makes `published` mean anything — the status column is
written and read back, and that is all. This change is what gives it consequence.

It also closes the loop on the requirement the brief states twice: a draft must be unreachable from
the public side, both by guessing its URL and through the public API. That is the same guarantee in
two places, so it is built as one rule with two callers rather than two checks that can disagree.

This change additionally carries the project's documentation — `README.md` and `AI-WORKLOG.md` —
because both are deliverables in their own right and neither can be finished before the system they
describe exists.

## What Changes

- A catalogue at `/` listing published products, each linking to its page.
- A product page at `/products/[slug]` showing the name, characteristics and saved description.
- The SEO title and description driving that page's `<title>` and meta description.
- `GET /api/public/products` and `GET /api/public/products/[slug]` — the public REST surface the
  brief names, answering with the same published-only rule the pages use.
- Published-only reads as one choke point in `src/lib/services/products.ts`, with the status in the
  query rather than checked afterwards.
- Public routes rendered per-request, so unpublishing takes effect immediately.
- `README.md` and `AI-WORKLOG.md`.

## Capabilities

### New Capabilities

- `public-catalog`: what a visitor can see without signing in, what a draft must never reveal to them, and how a product's saved content and SEO fields reach the page.

### Modified Capabilities

None. `product-editing` already specifies that status is stored and returned; this change gives
that stored value its public effect without changing what the editor promises.

## Impact

- `src/app/page.tsx` stops being the scaffold's placeholder and becomes the catalogue.
- The service layer gains its published-only helpers, which every public caller must use — a public
  route writing its own `where` clause would defeat the single choke point.
- Public routes opt out of caching deliberately; the reasoning is recorded in `design.md` rather
  than left as an unexplained export.
- This is the last change, so its close-out includes the final documentation pass over every
  `CLAUDE.md`, rule and spec.
