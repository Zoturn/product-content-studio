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

  it('removes a product from the catalogue and 404s its page the moment it is unpublished', () => {
    cy.loginAsAdmin();

    cy.request('/api/admin/products').then((listResponse) => {
      const summary = (listResponse.body as Array<{ id: string; name: string }>).find(
        (p) => p.name === 'Cascade Mechanical Keyboard',
      );

      cy.request(`/api/admin/products/${summary!.id}`).then((getResponse) => {
        const body = getResponse.body as {
          description: string;
          seoTitle: string;
          seoDescription: string;
        };
        // Only the four fields PATCH accepts — the GET response also carries id/slug/name/
        // attributes, and the schema is .strict(), so spreading the whole body would be
        // rejected as an attempt to write the read-only fields.
        const editable = {
          description: body.description,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
        };

        // Starts visible.
        cy.visit('/');
        cy.contains('Cascade Mechanical Keyboard');

        cy.request('PATCH', `/api/admin/products/${summary!.id}`, {
          ...editable,
          status: 'DRAFT',
        }).then(() => {
          // Gone from the catalogue and 404 on its page — no ISR window, per force-dynamic.
          cy.visit('/');
          cy.contains('Cascade Mechanical Keyboard').should('not.exist');

          cy.request({ url: '/products/mechanical-keyboard', failOnStatusCode: false })
            .its('status')
            .should('eq', 404);

          // Restore, so later specs (and a later run of this one) see the seeded state again.
          cy.request('PATCH', `/api/admin/products/${summary!.id}`, {
            ...editable,
            status: 'PUBLISHED',
          }).then(() => {
            cy.visit('/');
            cy.contains('Cascade Mechanical Keyboard');
          });
        });
      });
    });
  });
});
