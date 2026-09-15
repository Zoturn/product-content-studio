describe('public product page', () => {
  it('shows the product name, characteristics and saved description', () => {
    cy.visit('/products/wireless-mouse');

    cy.contains('Aurora Wireless Mouse');
    cy.contains('Graphite');
    cy.contains('A quiet, low-latency mouse');
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

  it('renders a script payload in the description as inert text, not executable markup', () => {
    const payload = 'Safe text. <script>window.__xssProof = true;</script> More safe text.';

    cy.loginAsAdmin();
    cy.request('/api/admin/products').then((listResponse) => {
      const product = (listResponse.body as Array<{ id: string; name: string }>).find(
        (p) => p.name === 'Aurora Wireless Mouse',
      );

      cy.request('PATCH', `/api/admin/products/${product!.id}`, {
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
