describe('public catalog', () => {
  it('lists the seeded published products and excludes the seeded draft', () => {
    cy.visit('/');

    cy.contains('Aurora Wireless Mouse');
    cy.contains('Cascade Mechanical Keyboard');
    cy.contains('Halo Smart Desk Lamp').should('not.exist');
  });

  it('links each product to its page', () => {
    cy.visit('/');
    cy.contains('Aurora Wireless Mouse').click();

    cy.location('pathname').should('eq', '/products/wireless-mouse');
  });

  it('works with no session cookie, since the public side needs none', () => {
    // No cy.loginAsAdmin() anywhere in this spec — every request here is genuinely unauthenticated.
    cy.request('/').its('status').should('eq', 200);
    cy.request('/api/public/products').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });
  });
});
