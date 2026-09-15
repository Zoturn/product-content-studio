describe('editing a product', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/products');
    cy.contains('Aurora Wireless Mouse').click();
    cy.location('pathname').should('match', /^\/admin\/products\/.+/);
  });

  // Two tests below persist a real save. Restoring the seeded values afterward keeps this spec
  // independent of run order — public-product-page.cy.ts asserts against wireless-mouse's
  // original seeded description, and Cypress specs otherwise share one un-reset database for
  // the whole suite (see .claude/rules/testing.md rule 6: the reset happens once, before the
  // run, not per spec).
  afterEach(() => {
    cy.request('/api/admin/products').then((listResponse) => {
      const product = (listResponse.body as Array<{ id: string; name: string }>).find(
        (p) => p.name === 'Aurora Wireless Mouse',
      );
      cy.request('PATCH', `/api/admin/products/${product!.id}`, {
        description:
          'A quiet, low-latency mouse built for long sessions at a desk or on the move. The ' +
          'contoured shape supports a relaxed grip, and the silent switches hold up over years of ' +
          'daily clicking without the click noise. Pairs with up to three devices and switches ' +
          'between them with a single button.',
        seoTitle: 'Aurora Wireless Mouse — Silent, Long-Battery Mouse',
        seoDescription:
          'Quiet wireless mouse with up to 70 days of battery, adjustable DPI, and three-device pairing.',
        status: 'PUBLISHED',
      });
    });
  });

  it('saves an edit and persists it across a reload', () => {
    const updated = 'A description edited by the Cypress edit-and-save spec.';

    // A single value+input mutation, like a paste — not character-by-character .type(), which
    // dispatches change events faster than any real keystroke ever could and was tripping a
    // reentrant measurement loop in MUI's multiline autosize. See the fix commit for the repro:
    // no human typing speed reaches it, but a truly-synchronous event stream does.
    cy.get('textarea[name="description"]').clear();
    cy.get('textarea[name="description"]').invoke('val', updated).trigger('input');
    cy.contains('button', 'Save').click();

    cy.contains('Saved.');

    cy.reload();
    cy.get('textarea[name="description"]').should('have.value', updated);
  });

  it('refuses an over-limit description, shows the error on the field, keeps the typed value, and shows no success', () => {
    const tooLong = 'a'.repeat(1001);

    cy.get('textarea[name="description"]').clear();
    cy.get('textarea[name="description"]').invoke('val', tooLong).trigger('input');
    cy.contains('button', 'Save').click();

    cy.contains('Description must be 1000 characters or fewer');
    cy.contains('Saved.').should('not.exist');
    cy.get('textarea[name="description"]').invoke('val').should('have.length', 1001);
  });

  it('warns before leaving with unsaved edits', () => {
    cy.get('input[name="seoTitle"]').type(' (unsaved)', { delay: 0 });

    cy.on('window:confirm', (message) => {
      expect(message).to.contain('unsaved changes');
      return false;
    });
    cy.contains('Back to products').click();

    cy.location('pathname').should('match', /^\/admin\/products\/.+/);
  });

  it('does not warn when leaving right after a successful save', () => {
    // Regression test: the form used to never re-baseline its dirty tracking after a save, so
    // formState.isDirty stayed true forever after the first edit and this exact flow — edit,
    // save, then leave — incorrectly warned about "unsaved changes" that had, in fact, been
    // saved. See the fix commit for the full-project review finding this came from.
    const updated = 'A description edited right before leaving, and then saved.';
    cy.get('textarea[name="description"]').clear();
    cy.get('textarea[name="description"]').invoke('val', updated).trigger('input');
    cy.contains('button', 'Save').click();
    cy.contains('Saved.');

    cy.on('window:confirm', () => {
      throw new Error('window.confirm should not fire after a successful save');
    });
    cy.contains('Back to products').click();

    cy.location('pathname').should('eq', '/admin/products');
  });
});
