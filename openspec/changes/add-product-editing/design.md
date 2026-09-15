## Context

This change implements the brief's central feature, and with it the requirement most likely to be
tested directly: that invalid content cannot be saved even by a caller who bypasses the interface.
That single sentence decides most of what follows — the form cannot be where the rule lives, and the
form's limits and the server's limits cannot be two separate pieces of knowledge.

The admin boundary already exists from `admin-authentication`, so this change adds endpoints behind
it rather than reasoning about access again.

## Goals / Non-Goals

**Goals:** edit the four editable fields; refuse invalid content from any caller; never lose the
administrator's typed work; make the limits visible before they are hit.

**Non-Goals:** creating or deleting products, editing the name or characteristics, bulk actions,
optimistic concurrency between simultaneous editors, and any public-facing effect of status — the
last belongs to `add-public-catalog`, which is the change that needs it.

## Decisions

### One schema, with its limits exported as constants

`src/lib/validation/product.ts` exports both `productUpdateSchema` and the `PRODUCT_LIMITS` object
the schema is built from. The character counters read the same constants.

_Alternatives:_ writing `maxLength={1000}` in the component beside a `.max(1000)` in the schema,
which is the exact duplication `api-and-validation.md` warns about — two numbers that agree today
and silently disagree after someone edits one of them. Exporting the constants makes the drift
impossible rather than merely discouraged.

### `PATCH` takes the whole editable payload, not a partial one

The endpoint accepts all four editable fields together and validates them as a unit.

_Alternatives:_ a partial update accepting whatever subset was sent, which reads well until a field
needs clearing — an absent key and an emptied field become indistinguishable — and which makes
`.strict()` far weaker, since "this key is unknown" and "this key was omitted" stop being separable.
The editor always has all four values, so a partial payload buys nothing here.

### Status is a field in the editor, not a separate publish action

Publishing is a status change saved with everything else.

_Alternatives:_ a publish/unpublish control on the list row, which is more convenient but requires
partial updates (or a second endpoint) purely for one field, and splits "what is saved" across two
mechanisms. The brief describes status as one of the edited fields, so it stays one of them.

### The admin side reads through TanStack Query; the public side will not

The list and the editor fetch from the REST API with `useQuery`, and saves go through `useMutation`,
invalidating both the list and that product on success.

_Alternatives:_ server-rendering the admin pages and passing data as props, which gives a faster
first paint but leaves the mutation resyncing server-rendered state through `router.refresh()`,
mixing two models of where the truth lives. The admin area has no SEO requirement to trade away, so
the consistent client-side cache is worth more than the first paint. The public catalogue makes the
opposite trade for the opposite reason.

### Field errors are mapped onto fields, not shown as a banner

The `fieldErrors` from the envelope are applied with react-hook-form's `setError`.

_Alternatives:_ one summary message, which tells the user something is wrong and leaves them to find
which of four fields it was — the failure is reported without being actionable.

### Read-only values are text, not disabled inputs

The name and characteristics render as typography.

_Alternatives:_ disabled text fields, which look like inputs that might become editable under some
condition, promising a capability the application deliberately does not have.

### The unsaved-changes warning is deliberately two mechanisms

`beforeunload` covers reload, tab close and leaving the site; the editor's own "back to products"
control asks for confirmation before navigating.

_Alternatives:_ intercepting all client-side navigation, which the App Router has no supported API
for — the available approaches patch the router or monkey-patch history, and both break quietly on a
framework upgrade. Guarding the one in-app exit the editor actually offers achieves the same result
for the paths a user takes, without depending on internals. The gap this leaves is stated under
Risks rather than papered over.

## Risks / Trade-offs

- **The browser's own back button bypasses the warning.** → `beforeunload` does not fire on a
  client-side history navigation, and the App Router exposes no route-change guard. Accepted and
  documented: the two paths a user is most likely to take — closing the tab and clicking out of the
  editor — are both covered. Fixing the third properly needs framework internals this project should
  not depend on.
- **Two editors open on the same product would overwrite each other silently.** → There is exactly
  one administrator account and no requirement for concurrent editing. Adding version checks would
  be inventing a problem; naming it in the README is the honest alternative.
- **Counters could still mislead if a limit changes only in the schema.** → Mitigated by deriving
  both from `PRODUCT_LIMITS`, and by tests asserting the boundary values rather than the copy.
- **Status is editable here but has no visible effect yet.** → Intentional sequencing: the public
  side is a separate capability. The spec for this change therefore promises only that status is
  stored and returned, so it cannot be read as promising visibility it does not yet deliver.

## Migration Plan

No schema change: every column already exists from `platform-foundation`. `/admin` changes from a
placeholder to a redirect, which no external caller depends on.

## Open Questions

None blocking. Whether the list eventually needs filtering or pagination is a question for a
catalogue larger than three seeded products.
