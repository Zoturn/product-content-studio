describe('drafts are unreachable from the public side', () => {
  it('404s the draft product page, identically to an unknown slug', () => {
    cy.request({ url: '/products/smart-desk-lamp', failOnStatusCode: false })
      .its('status')
      .should('eq', 404);

    cy.request({ url: '/products/does-not-exist', failOnStatusCode: false })
      .its('status')
      .should('eq', 404);
  });

  it('404s the draft through the public API, identically to an unknown slug', () => {
    cy.request({ url: '/api/public/products/smart-desk-lamp', failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error.code).to.eq('NOT_FOUND');
      },
    );

    cy.request({ url: '/api/public/products/does-not-exist', failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error.code).to.eq('NOT_FOUND');
      },
    );
  });

  describe('when a published product is unpublished', () => {
    // A hook rather than a restore at the end of the test body: an assertion failing partway
    // would skip an inline restore and leave the keyboard a draft for every later spec.
    afterEach(() => {
      cy.restoreSeededProduct('Cascade Mechanical Keyboard');
    });

    it('removes it from the catalogue and 404s its page immediately', () => {
      cy.loginAsAdmin();

      // Starts visible.
      cy.visit('/');
      cy.contains('Cascade Mechanical Keyboard');

      cy.findAdminProductId('Cascade Mechanical Keyboard').then((id) => {
        cy.request(`/api/admin/products/${id}`).then((getResponse) => {
          const body = getResponse.body as {
            description: string;
            seoTitle: string;
            seoDescription: string;
          };
          // Only the four fields PATCH accepts — the GET response also carries id/slug/name/
          // attributes, and the schema is .strict(), so spreading the whole body would be
          // rejected as an attempt to write the read-only fields.
          cy.request('PATCH', `/api/admin/products/${id}`, {
            description: body.description,
            seoTitle: body.seoTitle,
            seoDescription: body.seoDescription,
            status: 'DRAFT',
          });
        });
      });

      // Gone from the catalogue and 404 on its page — no ISR window, per force-dynamic.
      cy.visit('/');
      cy.contains('Cascade Mechanical Keyboard').should('not.exist');

      cy.request({ url: '/products/mechanical-keyboard', failOnStatusCode: false })
        .its('status')
        .should('eq', 404);
    });
  });
});
