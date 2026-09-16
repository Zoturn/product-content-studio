## Why

Found by using the site, not by testing it. A visitor who opens a product from the catalogue has
no way back to it from the page itself — the only route is the browser's back button. Every test
passes, because every test either starts at the catalogue or navigates by URL; none of them ever
needed to get back.

The admin side already has this affordance: the editor carries a "← Back to products" control, and
the archived `product-editing` spec required it. The public side was specified as far as "the
catalogue links to each product page" and no further, so the return trip was never described and
therefore never built. This change closes that asymmetry.

It is deliberately small. The browser's back button works and no requirement is currently failing;
this is a usability gap rather than a defect, and it is proposed as its own change rather than
folded into a commit of unrelated fixes so the record stays legible.

## What Changes

- A link on `/products/[slug]` back to the catalogue at `/`.
- One end-to-end test covering the round trip: catalogue → product → catalogue.

Out of scope: any broader navigation (a header, breadcrumbs, a persistent nav bar). Those would be
a larger design question about what the public side's chrome should be, and the brief does not ask
for one.

## Capabilities

### Modified Capabilities

- `public-catalog` — gains a requirement that a visitor can return to the catalogue from a product
  page. No existing requirement changes meaning; this adds one the spec did not previously cover.
