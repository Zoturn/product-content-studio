---
paths:
  - "src/app/**"
  - "src/components/**"
  - "src/lib/services/**"
---

# Data fetching

**Scope:** which side of the server/client boundary a read belongs on, and how the admin client talks to the REST API. The shape of the API itself is in api-and-validation.md.

## Rules

1. Server Components read through `src/lib/services/**` directly, because an extra HTTP hop to this application's own API costs a round trip and throws away end-to-end type safety for nothing.
2. A Server Component must never `fetch()` this application's own route handlers — during render that is the server calling itself, and it breaks the moment the port, base URL or deployment topology changes.
3. The catalog and product pages stay Server Components, because `generateMetadata` needs the same product the body renders and a crawler must see the SEO fields in the delivered HTML rather than after hydration.
4. Client components fetch with TanStack Query rather than `useEffect` plus `fetch`, because pending, error and success are exactly the states this project is assessed on and a hand-rolled version of them drifts out of sync with the request.
5. Give every query a stable, parameterised key — `['admin', 'products']`, `['admin', 'product', id]` — so a mutation can invalidate precisely what changed instead of blowing away the whole cache.
6. Writes go through `useMutation`, and the submit control's disabled state is driven by `isPending`, so a slow save cannot be double-submitted into two conflicting writes.
7. Invalidate affected queries in `onSuccess` only; invalidating before the server confirms would redisplay a failed save as though it had landed.
8. On error, leave form state untouched and surface the server's message — the user's typed edits are the one thing a failed request must never cost them.
9. Create the `QueryClient` inside `useState(() => new QueryClient())` in a client provider, never as a module-level singleton, because a module-level client is shared across requests on the server and can leak one user's cached data into another's response.
10. Mount the provider in the admin layout rather than the root layout, since the public pages never fetch on the client and should not carry the runtime.
11. Never import a server-only module — the Prisma client, auth helpers, anything reading a secret — into a file carrying `'use client'`, because that import path is what pulls a secret into the browser bundle.

## Examples

```tsx
// no — the server calling its own API, and losing types on the way
export default async function Page() {
  const res = await fetch("http://localhost:3000/api/public/products");
  const products = await res.json();
  return <Catalog products={products} />;
}

// yes — read the service layer directly
export default async function Page() {
  const products = await getPublishedProducts();
  return <Catalog products={products} />;
}
```

```tsx
// no — a failed save wipes what the user typed, and "saved" is a lie
onError: () => reset();

// yes — keep the edits, report what the server said
onError: (error) => setSaveError(error.message);
onSuccess: () =>
  queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
```

## Anti-patterns

- A Server Component fetching its own route handler over HTTP instead of calling the service.
- `useEffect` plus `fetch` plus three `useState`s reimplementing what `useQuery` already models.
- A module-level `new QueryClient()`, shared across requests and across users.
- Resetting or clearing the form inside a mutation's `onError`.
- Invalidating or redirecting before the server has confirmed the write.
- Reaching for a client fetch on a public page, trading away SEO for no benefit.
