## 1. Validation

- [ ] 1.1 Add `src/lib/validation/product.ts` exporting `PRODUCT_LIMITS` (description 1000, seoTitle 60, seoDescription 160) and a `productUpdateSchema` built from those constants
- [ ] 1.2 Require all four editable fields, trim before length checks so whitespace-only counts as empty, and state the limit in each message
- [ ] 1.3 Declare the schema `.strict()` so `name` or `attributes` in a payload is a validation error rather than an ignored key
- [ ] 1.4 Export `ProductUpdateInput` as `z.infer` of the schema rather than declaring a parallel type

## 2. Service layer

- [ ] 2.1 Add `src/lib/services/products.ts` with `listProducts()` returning id, name and status for the admin list
- [ ] 2.2 Add `getProductForEditing(id)` returning the full editable product, or `null` when no such product exists
- [ ] 2.3 Add `updateProduct(id, input)` writing only the four editable fields, never name or attributes
- [ ] 2.4 Use explicit `select` in each query so a column added later cannot leak into a response by default

## 3. API

- [ ] 3.1 Add `GET /api/admin/products` returning `{id, name, status}[]`, calling `requireAdmin` first
- [ ] 3.2 Add `GET /api/admin/products/[id]` returning the full product for the editor, 404 when it does not exist
- [ ] 3.3 Add `PATCH /api/admin/products/[id]` parsing the body with `safeParse` before any write
- [ ] 3.4 Return `VALIDATION_ERROR` with `fieldErrors` from `z.flattenError` on a rejected payload, and leave the record untouched
- [ ] 3.5 Await `params` in both `[id]` handlers, since they are Promises in Next 15

## 4. List

- [ ] 4.1 Add `/admin/products` fetching with `useQuery`, showing each product's name and status
- [ ] 4.2 Show a pending state while loading and a readable message if the request fails
- [ ] 4.3 Link each row to its editor, and mark status visibly enough to tell draft from published at a glance
- [ ] 4.4 Redirect `/admin` to `/admin/products`, replacing the placeholder page from `add-admin-authentication`

## 5. Editor

- [ ] 5.1 Add `/admin/products/[id]` loading the product with `useQuery` and a pending state
- [ ] 5.2 Render name and characteristics as read-only text, not disabled inputs
- [ ] 5.3 Build the form with react-hook-form and `zodResolver(productUpdateSchema)`, defaulting to the saved values
- [ ] 5.4 Add live character counters for the three limited fields, reading `PRODUCT_LIMITS`
- [ ] 5.5 Save through `useMutation` on explicit submit only, disabling the control while `isPending`
- [ ] 5.6 On success, invalidate the list and this product, and show confirmation only after the server responds
- [ ] 5.7 On a validation failure, map `fieldErrors` onto fields with `setError` and keep every typed value
- [ ] 5.8 On any other failure, report it and keep every typed value
- [ ] 5.9 Warn before leaving with unsaved edits: `beforeunload`, plus a confirmation on the editor's own back control
- [ ] 5.10 Check the list and editor at a mobile width

## 6. Tests

- [ ] 6.1 Jest — schema accepts values exactly at 1000, 60 and 160
- [ ] 6.2 Jest — schema rejects 1001, 61 and 161, and reports the offending field
- [ ] 6.3 Jest — schema rejects empty and whitespace-only values for each required field
- [ ] 6.4 Jest — schema rejects an unknown key such as `name`, proving `.strict()`
- [ ] 6.5 Jest — `updateProduct` writes only the four editable fields, with Prisma mocked
- [ ] 6.6 Cypress — edit a seeded product, save, reload, and confirm the values persisted
- [ ] 6.7 Cypress — an over-limit value is refused, the message appears against that field, the typed values remain, and no success is shown
- [ ] 6.8 Cypress — `cy.request` a `PATCH` with an over-limit description and assert 400 `VALIDATION_ERROR` and that the stored product is unchanged
- [ ] 6.9 Cypress — `cy.request` a `PATCH` containing `name` and assert it is refused
- [ ] 6.10 Cypress — the list shows the seeded draft and published products with their statuses

## 7. Documentation and close out

- [ ] 7.1 Record for the README: that status has no public effect until `add-public-catalog`, and the two known limitations — browser back bypasses the unsaved warning, and no concurrent-edit protection
- [ ] 7.2 Run `npm run typecheck && npm run lint && npm test` clean
- [ ] 7.3 Run `npm run db:reset && npm run e2e` clean
- [ ] 7.4 Run `npm run spec:validate`
- [ ] 7.5 Archive the change, write the generated spec's Purpose, and act on what the docs-sync hook reports
