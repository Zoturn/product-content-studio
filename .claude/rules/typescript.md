---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/tsconfig*.json"
---

# TypeScript conventions

**Scope:** Type-level discipline across the whole repo — strictness, inference, boundaries. It does not cover runtime validation of untrusted input, which belongs to `api-and-validation.md`.

## Rules

1. Keep `strict` on and never relax a compiler flag to make code compile, because loosening a flag changes the guarantees of the entire codebase to solve one local problem.
2. Never use `any`; take `unknown` at an untyped boundary and narrow it explicitly, since `any` does not silence one error, it disables checking for everything that value touches.
3. Derive payload types from the Zod schema with `z.infer<typeof productUpdateSchema>` rather than declaring a matching interface, because a hand-written twin drifts from the validator and the drift is invisible until production.
4. Type function parameters and exported return values explicitly at module boundaries, so a breaking change surfaces at the definition rather than at every call site.
5. Justify every `@ts-expect-error` with a comment naming the reason and prefer it over `@ts-ignore`, because `@ts-expect-error` fails once the underlying problem is fixed and so cleans itself up.
6. Do not use a non-null assertion to silence the compiler on a value that can genuinely be null or undefined — the assertion removes the warning, not the crash.
7. Read environment variables only through the single typed module `src/lib/env.ts`, never as `process.env.X!` scattered through the codebase, so a missing variable is one startup failure instead of an undefined that surfaces hours later.
8. Model results that can fail as discriminated unions rather than objects of optional fields, because a union forces the caller to handle the failure branch while optional fields let it be forgotten.
9. Prefer `readonly` arrays and `as const` for fixed sets such as product statuses, since accidental mutation of shared constants is a bug the type system can prevent for free.
10. Import across the repo with the `@/*` alias instead of long relative chains, so moving a file does not rewrite the imports of every file that used it.
11. Keep types next to the code that owns them and export them from there rather than collecting a repo-wide `types.ts`, because a shared dumping ground hides who actually depends on what.

## Examples

```ts
// no: a duplicate interface that will drift from the schema that validates the data
interface ProductUpdate {
  description: string;
  seoTitle: string;
  seoDescription?: string;
}

// yes: one source of truth, inferred
import { productUpdateSchema } from "@/lib/validation/product";
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
```

```ts
// no: `any` disables checking for everything downstream of `body`
const body: any = await request.json();

// yes: unknown at the boundary, narrowed by the schema
const body: unknown = await request.json();
const parsed = productUpdateSchema.safeParse(body);
if (!parsed.success) return validationError(parsed.error);
```

## Anti-patterns

- Casting with `as` to make a mismatch compile, which asserts a fact the compiler had already disproved.
- Turning off `strictNullChecks` or adding a file-level `@ts-nocheck` to unblock a build.
- Parallel hand-written types shadowing inferred schema types, so client and server disagree about the same payload.
- `process.env.DATABASE_URL!` inline, which trades a clear startup error for an obscure failure deep in a request.
- Optional-field result objects (`{ data?, error? }`) that let a caller read `data` on a failed call.
