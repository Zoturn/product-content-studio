---
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "cypress/**"
  - "jest.config.ts"
---

# Testing

**Scope:** What is tested, with which of the project's two runners, and what a test must prove. It does not define the behaviour under test; the specs do that.

## Rules

1. Use Jest for pure logic and server modules — validation schemas, auth helpers, and the service layer with Prisma mocked — because those have no boundary to cross and deserve tests that run in milliseconds.
2. Use Cypress for anything that crosses a boundary: API behaviour through `cy.request`, and complete user flows through the browser, since a guarantee about HTTP is only proven over real HTTP.
3. Keep to those two runners; a single unit runner and a single end-to-end runner mean one configuration, one reporter and one command each, which is what makes the suite maintainable by the next person.
4. Place unit specs beside the code they cover as `*.spec.ts`, so a reader opening a module immediately sees whether it is tested and a deleted module takes its test with it.
5. Require the whole suite to run offline with no external service, API key or network call, because a test that needs someone else's uptime fails for reasons that say nothing about this codebase.
6. Reset and reseed the database with `npm run db:reset` before a Cypress run, so every assertion starts from the same known fixtures rather than from whatever the last run left behind.
7. Assert against the seeded slugs and fields by name instead of "the first product in the list", because an order-dependent test passes and fails for reasons unrelated to the change being made.
8. Test both sides of every limit — 1000 and 1001 characters, 60 and 61, 160 and 161 — plus the empty value, since an off-by-one in a length check is exactly the defect a reviewer probes for first.
9. Write a test that attempts each security violation: an unauthenticated call to an admin endpoint, a draft fetched by direct URL and by public API, and a script payload saved as a description and then read back as text — a guarantee with no failing-path test is only an assumption.
10. Assert that a failed save leaves the form's values intact and reports an error, because the recovery path is a graded requirement and nothing else exercises it.
11. Assert on the error envelope's `code` and status rather than on message wording, so tests survive copy changes but still catch a contract break.
12. Treat a task as complete when its test passes, not when its code exists, since untested code is a claim rather than a result.

## Examples

```ts
// no: asserts on prose and on whatever happens to be first
expect(res.body.error.message).toBe("Some fields need attention.");

// yes: boundary values, asserted on the contract
it("rejects an SEO title of 61 characters", () => {
  const result = productUpdateSchema.safeParse({
    ...valid,
    seoTitle: "a".repeat(61),
  });
  expect(result.success).toBe(false);
});
```

```ts
// yes: the violation attempt, made over real HTTP
cy.request({ url: "/api/admin/products", failOnStatusCode: false }).then(
  (res) => {
    expect(res.status).to.eq(401);
    expect(res.body.error.code).to.eq("UNAUTHORIZED");
  },
);

cy.request({ url: "/api/products/draft-seeded-slug", failOnStatusCode: false })
  .its("status")
  .should("eq", 404);
```

## Anti-patterns

- Tests that only exercise the happy path, leaving every guarantee the brief grades unverified.
- Mocking the authorisation helper in an end-to-end test, which proves the mock returns what it was told to.
- Depending on records left by a previous run, so the suite passes locally and fails on a clean checkout.
- Asserting `toBeTruthy()` on a response, which passes for a 401 as readily as for the 200 that was meant.
- A test that reaches the network, making a failure ambiguous between a bug and someone else's outage.
