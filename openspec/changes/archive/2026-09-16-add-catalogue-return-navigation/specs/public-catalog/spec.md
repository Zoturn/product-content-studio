## ADDED Requirements

### Requirement: A visitor can return to the catalogue from a product page

A published product's page SHALL offer a visible control returning to the catalogue, so a visitor
who followed a link into a product can continue browsing without relying on the browser's back
button or editing the URL.

#### Scenario: Returning from a product page

- **WHEN** a visitor opens a published product from the catalogue and activates the return control
- **THEN** the catalogue is shown again, listing the published products

#### Scenario: The control is reachable on a page opened directly

- **WHEN** a visitor opens a published product's page directly by its URL, with no catalogue visit
  beforehand
- **THEN** the return control is present and leads to the catalogue, rather than depending on
  browser history that does not exist

#### Scenario: Returning requires no session

- **WHEN** a visitor with no session cookie uses the return control
- **THEN** the catalogue is served normally, with no redirect to sign-in
