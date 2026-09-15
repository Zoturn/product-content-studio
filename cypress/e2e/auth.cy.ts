import type { AdminFixture } from '../support/commands';

describe('admin sign-in', () => {
  let admin: AdminFixture;

  before(() => {
    cy.fixture<AdminFixture>('admin').then((fixture) => {
      admin = fixture;
    });
  });

  beforeEach(() => {
    cy.visit('/admin/login');
  });

  it('reaches the admin area with the seeded credentials', () => {
    cy.get('input[name="email"]').type(admin.email);
    cy.get('input[name="password"]').type(admin.password);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('eq', '/admin');
    cy.contains(`Signed in as ${admin.email}`);
  });

  it('shows an error and stays on sign-in for a wrong password', () => {
    cy.get('input[name="email"]').type(admin.email);
    cy.get('input[name="password"]').type('definitely-the-wrong-password');
    cy.get('button[type="submit"]').click();

    cy.contains('Incorrect email or password.');
    cy.location('pathname').should('eq', '/admin/login');
  });

  it('shows the same error for an email with no account', () => {
    cy.get('input[name="email"]').type('nobody@example.com');
    cy.get('input[name="password"]').type('whatever-password');
    cy.get('button[type="submit"]').click();

    cy.contains('Incorrect email or password.');
    cy.location('pathname').should('eq', '/admin/login');
  });

  it('keeps the typed email when the password is rejected', () => {
    cy.get('input[name="email"]').type(admin.email);
    cy.get('input[name="password"]').type('definitely-the-wrong-password');
    cy.get('button[type="submit"]').click();

    cy.contains('Incorrect email or password.');
    cy.get('input[name="email"]').should('have.value', admin.email);
  });
});
