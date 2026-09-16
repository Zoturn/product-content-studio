# public-catalog Specification

## Purpose
What a visitor may see without signing in: the catalogue of published products, a product's saved content and SEO metadata, and the guarantee that a draft is unreachable — by URL or by API — indistinguishably from a product that does not exist.
## Requirements
### Requirement: The catalogue lists published products only

A visitor SHALL see every published product in the catalogue, each linking to its own page. A product that is not published MUST NOT appear, by name or by any other detail.

#### Scenario: Published products are listed

- **WHEN** a visitor opens the catalogue
- **THEN** every published product appears with a link to its page

#### Scenario: A draft is absent from the catalogue

- **WHEN** a product is a draft
- **THEN** nothing about it appears in the catalogue — not its name, not a disabled entry, not a placeholder

#### Scenario: Nothing is published yet

- **WHEN** no product is published
- **THEN** the catalogue renders an empty state rather than failing

### Requirement: A product page shows the saved content

A published product's page SHALL show its name, its characteristics and the description exactly as the administrator saved it.

#### Scenario: Saved content is what the visitor sees

- **WHEN** a visitor opens a published product's page
- **THEN** the name, characteristics and current saved description are shown

#### Scenario: An edit reaches the public page

- **WHEN** an administrator saves a new description and the visitor reloads the page
- **THEN** the new description is shown

#### Scenario: Line breaks the author typed are preserved

- **WHEN** a saved description contains line breaks
- **THEN** they are visible on the page rather than collapsed into one run of text

### Requirement: Product content never executes as code

Content an administrator typed SHALL be rendered as text. Markup inside it MUST NOT be interpreted by the browser, regardless of what was saved.

#### Scenario: A script payload in a description

- **WHEN** a description containing `<script>` or an event-handler attribute is saved and the product page is opened
- **THEN** the payload is displayed as visible text and no script from it runs

### Requirement: SEO fields drive the page's metadata

The product's SEO title and SEO description SHALL be used as that page's document title and meta description, so what the administrator wrote is what a search engine reads.

#### Scenario: Metadata comes from the saved SEO fields

- **WHEN** a published product's page is requested
- **THEN** its document title is the saved SEO title and its meta description is the saved SEO description

#### Scenario: A draft's SEO fields are never rendered

- **WHEN** a draft's page is requested
- **THEN** no part of its SEO title or description appears in the response

### Requirement: Drafts are unreachable from the public side

A draft MUST NOT be reachable by a visitor through any public route — neither its page URL nor the public API. The refusal MUST be indistinguishable from that of a product which does not exist, so the public side cannot be used to discover unpublished work.

#### Scenario: A draft requested by its URL

- **WHEN** a visitor requests a draft product's page directly by its slug
- **THEN** the response is a 404 identical to the one a nonexistent slug produces

#### Scenario: A draft requested through the public API

- **WHEN** a client requests a draft product from the public API
- **THEN** the response is a 404 identical to the one a nonexistent slug produces

#### Scenario: Unpublishing takes effect immediately

- **WHEN** an administrator changes a published product to draft
- **THEN** the next public request for it is refused, with no interval during which the withdrawn content is still served

### Requirement: The public side requires no session

The catalogue, the product page and the public API SHALL be reachable with no session cookie, and MUST NOT be affected by whether one is present.

#### Scenario: A visitor with no session

- **WHEN** a visitor with no session cookie opens the catalogue or a published product's page
- **THEN** the content is served normally, with no redirect to sign-in

#### Scenario: The public API without a session

- **WHEN** the public API is called with no session cookie
- **THEN** it answers with published product data rather than an authorisation error

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

