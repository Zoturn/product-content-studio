describe('admin access control', () => {
  it('redirects a signed-out visitor away from the admin area', () => {
    cy.visit('/admin');
    cy.location('pathname').should('eq', '/admin/login');
  });

  it('refuses a signed-out direct call to an admin endpoint', () => {
    cy.request({ url: '/api/admin/me', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error.code).to.eq('UNAUTHORIZED');
    });
  });

  it('closes both the admin area and the admin endpoint again after signing out', () => {
    cy.loginAsAdmin();

    cy.contains('button', 'Sign out').click();
    cy.location('pathname').should('eq', '/admin/login');

    cy.request({ url: '/api/admin/me', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.visit('/admin');
    cy.location('pathname').should('eq', '/admin/login');
  });
});
