---
paths:
  - "src/app/**"
  - "middleware.ts"
  - "next.config.ts"
---

# Next.js App Router conventions

**Scope:** Routing, rendering boundaries, route handlers and metadata under the App Router. It does not cover payload validation or the database layer, which have their own rules.

## Rules

1. Keep components as Server Components by default and add `'use client'` only where interactivity, state or effects demand it, because every client boundary ships more JavaScript to the visitor and widens what could reach the browser bundle.
2. Push `'use client'` as far down the tree as possible — marking a layout or page turns everything it renders into client code, including things that only needed to render once on the server.
3. Await `params` and `searchParams`, which are Promises in Next 15; reading them synchronously yields a Promise object rather than the values and fails in ways the type system will warn you about first.
4. Read data for server-rendered pages directly through `src/lib/services/**`, never by having a page fetch the app's own HTTP API, because that adds a network hop, loses type safety and can bypass the server-side status filter.
5. Treat route handlers under `src/app/api/**` as the project's REST surface and return `NextResponse.json` with the shared error envelope, since a REST client needs a machine-readable body and a correct status code.
6. Never redirect an API caller; redirects answer page requests, and a 302 to a login page is parsed by a fetch client as a success with unexpected content instead of the 401 it needed.
7. Have `generateMetadata` read the product through the same status-filtered service call the page body uses, so a draft can never leak its SEO title into a rendered `<head>`.
8. Call `notFound()` for anything the caller is not permitted to see, not just for missing records, because an authorisation-shaped error message tells a stranger that the resource exists.
9. Treat `middleware.ts` as a coarse first gate and never as the only one — a matcher pattern that misses a path fails open and silently exposes every route it forgot.
10. Keep secrets and database access out of any module reachable from a client component, since anything in that import graph is bundled and served to the browser.
11. Set `dynamic` or revalidation deliberately on public catalogue routes, because a cached page for a product that has just been unpublished keeps serving content the admin intended to withdraw.

## Examples

```tsx
// no: params read synchronously, and a plain lookup that can return a draft
export default function Page({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });

// yes: awaited params, status-filtered service, 404 for anything not visible
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();
```

```ts
// no: an API route answering an unauthenticated call with a redirect
if (!session) return NextResponse.redirect(new URL("/login", request.url));

// yes: a status and an envelope the client can act on
if (!session) {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
    { status: 401 },
  );
}
```

## Anti-patterns

- `'use client'` at the top of a page or layout to fix one interactive button, dragging the whole subtree into the browser.
- A page calling `fetch('/api/...')` against its own app on the server, paying a round trip for data it could read directly.
- `generateMetadata` loading a product by a different query from the page, so a draft's title renders even though the body 404s.
- Relying solely on the middleware matcher for admin protection, leaving any path it fails to match unguarded.
- Returning a bare `new Response('Unauthorized', { status: 401 })`, breaking the envelope every other error obeys.
