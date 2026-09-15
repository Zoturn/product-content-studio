// Prisma's Json scalar has no shape guarantee at the type level (src/lib/services/products.ts
// types `attributes` as `unknown` deliberately). Both the admin editor and the public product
// page need to render these as key/value pairs, so this narrow lives here once rather than
// being duplicated — see the "reuse" finding from the full-project review that caught the
// original duplication risk in a different pair of files.
export function asAttributeEntries(attributes: unknown): [string, unknown][] {
  if (attributes && typeof attributes === 'object' && !Array.isArray(attributes)) {
    return Object.entries(attributes);
  }
  return [];
}
