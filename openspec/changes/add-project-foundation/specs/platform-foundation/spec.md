## ADDED Requirements

### Requirement: Seeded starting state

Following the README on a clean machine SHALL produce one administrator account and exactly three products. At least one product MUST be a draft and at least one MUST be published, so both sides of the public boundary can be exercised immediately.

#### Scenario: A reviewer follows the README

- **WHEN** the documented setup steps are run against an empty database
- **THEN** one administrator exists and exactly three products exist
- **AND** at least one product is a draft and at least one is published

#### Scenario: Seeding an already-seeded database

- **WHEN** the seed runs a second time
- **THEN** it completes without error and duplicates neither the administrator nor any product

#### Scenario: Seeded credentials are absent from the repository

- **WHEN** the administrator account is created
- **THEN** only a password hash is stored, derived at seed time from configuration rather than from any committed value

### Requirement: Product content model

A product SHALL carry a name and characteristics that the editor treats as read-only, the three editable content fields — description, SEO title and SEO description — and a status of draft or published. Each product MUST have a stable identifier suitable for use in a public URL.

#### Scenario: The public identifier survives an edit

- **WHEN** a product's editable content changes
- **THEN** its public identifier is unchanged, so a link shared earlier still resolves

#### Scenario: Status is not assumed to be public

- **WHEN** a product is created without an explicit status
- **THEN** it is a draft, so nothing becomes publicly visible through omission

### Requirement: Saved content outlives the process

Content SHALL be persisted in the relational database rather than in memory or a process-local cache, so it is still present after the application restarts.

#### Scenario: Restart after an edit

- **WHEN** content is saved and the application is then restarted
- **THEN** the saved content is returned unchanged

#### Scenario: A value longer than the field allows

- **WHEN** a value exceeding the stored field's limit reaches the database
- **THEN** the write is rejected rather than silently truncated
