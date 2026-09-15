## Context

This change makes `published` mean something. Until now the status column has been written and read
back without consequence; from here it decides what a stranger can see.

That makes the interesting work defensive rather than additive. The catalogue and the product page
are small. The part worth designing carefully is the boundary: one rule about what is publicly
visible, expressed once, with every public caller going through it — because the failure this
change can produce is not a broken page, it is unpublished work shown to someone who should never
have seen it.

## Goals / Non-Goals

**Goals:** a catalogue and product page for published products; SEO fields driving real metadata;
drafts unreachable by URL and by API, indistinguishably from nonexistent; author text that cannot
execute; the project's README and AI-WORKLOG.

**Non-Goals:** search, filtering, pagination, sorting, categories, images, related products, and any
caching layer. Three seeded products need none of it, and the brief asks for none of it.

## Decisions

### One published-only helper, with the status inside the query

`getPublishedProductBySlug(slug)` is `findFirst({ where: { slug, status: 'PUBLISHED' } })`. The page,
`generateMetadata` and the public API all call it; none writes its own `where` clause.

_Alternatives:_ `findUnique({ where: { slug } })` followed by a status check, which is the same
thing until someone adds an early return above the check, or refactors the function and keeps the
lookup while dropping the guard. Putting the constraint in the query means there is no version of
this code that fetches a draft and then decides — it never fetches one at all.

### A draft and a nonexistent product produce the same 404

Both the page and the API answer identically for "this is a draft" and "there is no such slug".

_Alternatives:_ a 403 for drafts, which is more honest about what happened and is exactly the
problem — it confirms the slug exists. Anyone could then enumerate unpublished work by watching
which slugs answer 403 rather than 404. The service returning `null` for both cases is what makes
the two indistinguishable at the callers, rather than each caller having to remember to blur them.

### Public routes render per request

Public routes are rendered dynamically rather than cached.

_Alternatives:_ ISR with a short `revalidate`, which would serve the catalogue from cache and be
faster, at the cost of a window in which a product the administrator has just unpublished is still
being served to the public. The brief makes status the thing that controls public availability, so a
stale page is not a performance trade-off, it is the requirement not holding. On-demand
revalidation would close that window properly, but it means the editor knowing about and correctly
invalidating every public path it affects — more machinery, and a new way to be wrong, for a
catalogue of three products. Per-request rendering is the version with no stale state to reason
about. Revisit if this ever serves real traffic.

### The public pages are Server Components reading the service layer directly

No client-side fetching on the public side.

_Alternatives:_ TanStack Query, as the admin screens use. It would put the content behind hydration,
where a crawler may not see it, and `generateMetadata` needs the product server-side anyway — so
client fetching would mean loading the same product twice by two different paths. The admin side
makes the opposite choice for the opposite reason: it has no SEO requirement and does have a cache
worth sharing between screens.

### `generateMetadata` calls the same helper as the page body

Both read through `getPublishedProductBySlug`.

_Alternatives:_ a separate query in `generateMetadata`, which is how a draft's SEO title ends up
rendered into a `<head>` on a page whose body correctly 404s — two lookups that can disagree about
what is visible.

### Author text is rendered as a React text child

The description is interpolated as text with `whiteSpace: 'pre-wrap'` preserving its line breaks.

_Alternatives:_ `dangerouslySetInnerHTML` with a sanitiser, which adds a dependency whose
configuration becomes the security boundary; or converting `\n` to `<br>` to get line breaks, which
means building HTML from author input and reopens precisely the hole that rendering text closes. CSS
gets the line breaks without any of that.

## Risks / Trade-offs

- **No caching at all on the public side.** → Accepted deliberately, and recorded here rather than
  left as an unexplained `dynamic` export. At three products the cost is invisible; under real
  traffic this is the first thing to revisit, and on-demand revalidation is the direction.
- **The catalogue has no pagination.** → Fine for the seeded data, and the brief asks for none. It
  would need one before a real catalogue.
- **This change carries the documentation.** → It is larger than the other three for that reason,
  and the README's "time spent" and the AI-WORKLOG's narrative are the candidate's own to state;
  this change produces them as drafts to be reviewed and owned, not as claims made on their behalf.

## Migration Plan

Nothing to migrate. No schema change, no data change — the seed already contains the published and
draft products this change makes visible and invisible respectively. `src/app/page.tsx` is replaced,
and nothing links to what it contained.

## Open Questions

None blocking. Whether the catalogue eventually needs search or pagination is a question for a
catalogue with more than three products in it.
