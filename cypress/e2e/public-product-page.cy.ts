describe('public product page', () => {
  it('shows the product name, characteristics and saved description', () => {
    cy.visit('/products/wireless-mouse');

    cy.contains('Aurora Wireless Mouse');
    cy.contains('Graphite');
    cy.contains('A quiet, low-latency mouse');
  });

  it('returns to the catalogue from a product opened by following a link', () => {
    cy.visit('/');
    cy.contains('a', 'Aurora Wireless Mouse').click();
    cy.location('pathname').should('eq', '/products/wireless-mouse');

    cy.contains('a', 'Back to products').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('Aurora Wireless Mouse');
    cy.contains('Cascade Mechanical Keyboard');
  });

  it('returns to the catalogue from a product opened directly by URL', () => {
    // The case a router.back() implementation would get wrong: arriving from a search result or a
    // pasted link, there is no history entry to go back to.
    cy.visit('/products/wireless-mouse');

    cy.contains('a', 'Back to products').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('Aurora Wireless Mouse');
  });

  it('uses the saved SEO fields as the document title and meta description', () => {
    cy.visit('/products/wireless-mouse');

    cy.title().should('eq', 'Aurora Wireless Mouse — Silent, Long-Battery Mouse');
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      'Quiet wireless mouse with up to 70 days of battery, adjustable DPI, and three-device pairing.',
    );
  });

  // Nested so the restore hook covers only the test that actually persists a save, and still
  // runs if that test fails partway through. The two tests above assert against wireless-mouse's
  // seeded description, and the database is reset once per run rather than per spec — without
  // this, running the suite and running this spec alone would not agree.
  describe('with a script payload saved as the description', () => {
    afterEach(() => {
      cy.restoreSeededProduct('Aurora Wireless Mouse');
    });

    it('renders it as inert text, not executable markup', () => {
      const payload = 'Safe text. <script>window.__xssProof = true;</script> More safe text.';

      cy.loginAsAdmin();
      cy.findAdminProductId('Aurora Wireless Mouse').then((id) => {
        cy.request('PATCH', `/api/admin/products/${id}`, {
          description: payload,
          seoTitle: 'Aurora Wireless Mouse — Silent, Long-Battery Mouse',
          seoDescription:
            'Quiet wireless mouse with up to 70 days of battery, adjustable DPI, and three-device pairing.',
          status: 'PUBLISHED',
        });
      });

      cy.visit('/products/wireless-mouse');

      // The payload is visible as literal text...
      cy.contains('<script>window.__xssProof = true;</script>');
      // ...and never actually ran.
      cy.window().then((win) => {
        expect((win as unknown as { __xssProof?: boolean }).__xssProof).to.eq(undefined);
      });
    });
  });
});
