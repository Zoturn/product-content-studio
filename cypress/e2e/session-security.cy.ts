import type { AdminFixture } from '../support/commands';

describe('session cookie security', () => {
  let admin: AdminFixture;

  before(() => {
    cy.fixture<AdminFixture>('admin').then((fixture) => {
      admin = fixture;
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('is not readable from document.cookie, because it is httpOnly', () => {
    cy.document().then((doc) => {
      expect(doc.cookie).not.to.include('pcs_session');
    });
  });

  it('carries no password hash in the identity response', () => {
    cy.request('/api/admin/me').then((response) => {
      expect(response.body).to.deep.equal({ email: admin.email });

      const raw = JSON.stringify(response.body).toLowerCase();
      expect(raw).not.to.include('hash');
      expect(raw).not.to.include(admin.password.toLowerCase());
    });
  });
});
