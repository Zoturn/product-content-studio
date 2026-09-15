/// <reference types="cypress" />

export type AdminFixture = { email: string; password: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Signs in via the real UI with the seeded admin credentials and waits for /admin. */
      loginAsAdmin(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  cy.fixture<AdminFixture>('admin').then(({ email, password }) => {
    cy.visit('/admin/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.location('pathname').should('eq', '/admin');
  });
});

export {};
