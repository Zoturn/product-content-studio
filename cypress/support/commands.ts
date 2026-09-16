/// <reference types="cypress" />

import { products } from '../../prisma/seed-data';

export type AdminFixture = { email: string; password: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Signs in via the real UI with the seeded admin credentials and waits for /admin. */
      loginAsAdmin(): Chainable<void>;
      /** Resolves a product's admin id by its seeded name. Requires an admin session. */
      findAdminProductId(name: string): Chainable<string>;
      /**
       * Restores a product to its seeded values. Any spec that persists a real save must call
       * this, because the database is reset once before the whole run rather than per spec
       * (see .claude/rules/testing.md rule 6) — without it, a mutation here silently changes the
       * fixtures a later spec asserts against, and re-running one spec alone behaves differently
       * from running the suite.
       */
      restoreSeededProduct(name: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  cy.fixture<AdminFixture>('admin').then(({ email, password }) => {
    cy.visit('/admin/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    // /admin redirects to /admin/products — see add-product-editing task 4.4.
    cy.location('pathname').should('eq', '/admin/products');
  });
});

Cypress.Commands.add('findAdminProductId', (name: string) => {
  return cy.request('/api/admin/products').then((response) => {
    const product = (response.body as Array<{ id: string; name: string }>).find(
      (candidate) => candidate.name === name,
    );
    // Fail loudly here rather than letting `undefined` reach a URL and 404 confusingly later.
    expect(product, `seeded product named "${name}"`).to.not.equal(undefined);
    return product!.id;
  });
});

Cypress.Commands.add('restoreSeededProduct', (name: string) => {
  // Sourced from prisma/seed-data.ts rather than re-typed here, so the restore cannot drift from
  // what the seed actually writes.
  const seeded = products.find((product) => product.name === name);
  expect(seeded, `seed entry for "${name}"`).to.not.equal(undefined);

  cy.findAdminProductId(name).then((id) => {
    cy.request('PATCH', `/api/admin/products/${id}`, {
      description: seeded!.description,
      seoTitle: seeded!.seoTitle,
      seoDescription: seeded!.seoDescription,
      status: seeded!.status,
    });
  });
});

export {};
