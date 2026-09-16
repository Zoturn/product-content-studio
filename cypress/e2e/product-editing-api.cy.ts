describe('product editing API enforcement', () => {
  let productId: string;

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.findAdminProductId('Aurora Wireless Mouse').then((id) => {
      productId = id;
    });
  });

  it('refuses an over-limit description sent directly to the API, and leaves the stored product unchanged', () => {
    cy.request(`/api/admin/products/${productId}`).then((before) => {
      const originalDescription = before.body.description;

      cy.request({
        method: 'PATCH',
        url: `/api/admin/products/${productId}`,
        failOnStatusCode: false,
        body: {
          description: 'a'.repeat(1001),
          seoTitle: 'Valid title',
          seoDescription: 'Valid SEO description.',
          status: 'PUBLISHED',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error.code).to.eq('VALIDATION_ERROR');
      });

      cy.request(`/api/admin/products/${productId}`).then((after) => {
        expect(after.body.description).to.eq(originalDescription);
      });
    });
  });

  it('refuses a payload carrying the read-only name field, and leaves the stored name unchanged', () => {
    cy.request({
      method: 'PATCH',
      url: `/api/admin/products/${productId}`,
      failOnStatusCode: false,
      body: {
        name: 'Hacked Name',
        description: 'Valid description.',
        seoTitle: 'Valid title',
        seoDescription: 'Valid SEO description.',
        status: 'PUBLISHED',
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error.code).to.eq('VALIDATION_ERROR');
    });

    cy.request(`/api/admin/products/${productId}`).then((after) => {
      expect(after.body.name).to.eq('Aurora Wireless Mouse');
    });
  });

  it('refuses a payload carrying the read-only attributes field, and leaves them unchanged', () => {
    cy.request({
      method: 'PATCH',
      url: `/api/admin/products/${productId}`,
      failOnStatusCode: false,
      body: {
        attributes: { color: 'hacked' },
        description: 'Valid description.',
        seoTitle: 'Valid title',
        seoDescription: 'Valid SEO description.',
        status: 'PUBLISHED',
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error.code).to.eq('VALIDATION_ERROR');
    });

    // Closing the loop, as the read-only name test above does: a 400 proves the request was
    // refused, not that nothing was written. Only re-reading proves the latter, and that is the
    // assertion that would catch a future refactor validating after the write instead of before.
    cy.request(`/api/admin/products/${productId}`).then((after) => {
      expect(after.body.attributes.color).to.eq('Graphite');
    });
  });
});
