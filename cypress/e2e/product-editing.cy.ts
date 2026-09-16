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
    cy.restoreSeededProduct('Aurora Wireless Mouse');
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

  // Regression test. The success banner was driven by mutation.isSuccess alone, which stays true
  // while the user carries on typing — leaving a green "Saved." above changes that were not
  // saved. That is a false confirmation of exactly the kind .claude/rules/ui-and-ux-states.md
  // rule 5 forbids: someone who sees it and dismisses the leave-without-saving prompt loses the
  // edit. Found by a full-project review pass after this feature had shipped green.
  it('withdraws the success banner as soon as the user edits again after saving', () => {
    cy.get('textarea[name="description"]').clear();
    cy.get('textarea[name="description"]')
      .invoke('val', 'Saved once, then edited again.')
      .trigger('input');
    cy.contains('button', 'Save').click();

    cy.contains('Saved.');

    // A further edit means there are now unsaved changes again.
    cy.get('input[name="seoTitle"]').clear();
    cy.get('input[name="seoTitle"]').invoke('val', 'An unsaved SEO title').trigger('input');

    cy.contains('Saved.').should('not.exist');
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
