# product-editing Specification

## Purpose
What an administrator may change about a product, what stays read-only, the limits the server enforces regardless of caller, and the guarantee that a failed save never costs them their typed work.
## Requirements
### Requirement: Listing products for editing

An administrator SHALL see every product with its name and its current status, regardless of whether it is a draft, and SHALL be able to open any of them for editing.

#### Scenario: Drafts and published products are both listed

- **WHEN** the administrator opens the product list
- **THEN** every seeded product appears with its name and status, drafts included

#### Scenario: Opening a product

- **WHEN** the administrator chooses a product from the list
- **THEN** its editor opens, showing that product's current saved values

### Requirement: Only content and status are editable

The description, SEO title, SEO description and status SHALL be editable. The product's name and its characteristics MUST NOT be editable, and a request that attempts to change either MUST be refused rather than silently ignored.

#### Scenario: Saving the editable fields

- **WHEN** the administrator changes the description, the SEO fields or the status and saves
- **THEN** the new values are stored and shown when the editor is reopened

#### Scenario: Name and characteristics are presented as read-only

- **WHEN** the editor is open
- **THEN** the name and characteristics are shown as text rather than as inputs, so no edit is implied

#### Scenario: A request tries to change the name

- **WHEN** a request to update a product includes the name or the characteristics
- **THEN** it is refused with a validation error and nothing about the product is changed

### Requirement: Content limits are enforced by the server

The description MUST be present and at most 1000 characters, the SEO title present and at most 60, the SEO description present and at most 160. These limits SHALL be enforced by the server for every request, whether it comes from the editor or directly from an API client. A value consisting only of whitespace counts as absent.

#### Scenario: Values exactly at the limit

- **WHEN** a product is saved with a description of 1000 characters, an SEO title of 60 and an SEO description of 160
- **THEN** the save succeeds

#### Scenario: A value one character over the limit

- **WHEN** any of those fields exceeds its limit by a single character
- **THEN** the save is refused, the response names the offending field, and the stored product is unchanged

#### Scenario: An empty or whitespace-only value

- **WHEN** a required field is submitted empty or as whitespace only
- **THEN** the save is refused and the stored product is unchanged

#### Scenario: An oversized value sent directly to the API

- **WHEN** an over-limit value is sent by an API client that never loaded the editor
- **THEN** it is refused exactly as it would be from the form, and nothing is written

### Requirement: Changes persist only when explicitly saved

A change SHALL be written only when the administrator saves it. Nothing is written while they type, and a saved change MUST still be present after the application restarts.

#### Scenario: Edits abandoned without saving

- **WHEN** the administrator edits fields and leaves without saving
- **THEN** reopening the product shows the previously saved values, not the abandoned edits

#### Scenario: A saved change outlives the process

- **WHEN** a change is saved and the application is restarted
- **THEN** reopening the product shows the saved change

### Requirement: A failed save preserves the administrator's work

When a save fails, the editor MUST keep the values the administrator typed, explain what went wrong, and MUST NOT present the attempt as successful.

#### Scenario: The server rejects the content

- **WHEN** a save is refused because a field breaks its limit
- **THEN** the message appears against that field, every typed value remains in the form, and no success is shown

#### Scenario: The save cannot reach the server

- **WHEN** a save fails for a reason other than validation
- **THEN** the editor reports the failure, keeps the typed values, and shows no success

#### Scenario: Leaving with unsaved edits

- **WHEN** the administrator tries to leave the editor with unsaved changes
- **THEN** they are warned before their edits are discarded

