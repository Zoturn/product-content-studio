describe('admin product list', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('shows the seeded draft and published products with their statuses', () => {
    cy.visit('/admin/products');

    cy.contains('Aurora Wireless Mouse')
      .closest('a')
      .within(() => cy.contains('Published'));

    cy.contains('Cascade Mechanical Keyboard')
      .closest('a')
      .within(() => cy.contains('Published'));

    cy.contains('Halo Smart Desk Lamp')
      .closest('a')
      .within(() => cy.contains('Draft'));
  });

  it('opens a product editor from the list', () => {
    cy.visit('/admin/products');
    cy.contains('Aurora Wireless Mouse').click();

    cy.location('pathname').should('match', /^\/admin\/products\/.+/);
    cy.contains('Aurora Wireless Mouse');
    cy.get('textarea[name="description"]').should('exist');
  });
});
