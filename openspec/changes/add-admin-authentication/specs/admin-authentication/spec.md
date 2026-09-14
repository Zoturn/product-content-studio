## ADDED Requirements

### Requirement: Signing in

An administrator SHALL exchange the seeded email and password for a session. Credentials that do not match MUST be refused, and the refusal MUST NOT reveal whether the email exists.

#### Scenario: Correct credentials

- **WHEN** the seeded email and password are submitted
- **THEN** a session is established and the administrative area becomes reachable

#### Scenario: Wrong password for a known email

- **WHEN** the seeded email is submitted with an incorrect password
- **THEN** sign-in is refused, no session is established, and the message does not say which field was wrong

#### Scenario: Unknown email

- **WHEN** an email with no account is submitted
- **THEN** the refusal is indistinguishable from the wrong-password case, so the response cannot be used to discover which accounts exist

### Requirement: Administrative access requires a session

Every administrative page and every administrative endpoint SHALL refuse a caller without a valid session, whether that caller arrives through the interface or calls the endpoint directly. A page request MUST be redirected to sign-in; an endpoint request MUST receive a 401 carrying the error envelope, never a redirect.

#### Scenario: Signed-out visitor opens an admin page

- **WHEN** a visitor with no session requests an administrative page
- **THEN** they are redirected to sign-in and no administrative content is rendered

#### Scenario: Signed-out caller requests an admin endpoint directly

- **WHEN** a caller with no session requests an administrative endpoint
- **THEN** the response is 401 with code `UNAUTHORIZED` and carries no administrative data

#### Scenario: Altered or expired session

- **WHEN** a request presents a session cookie whose signature does not verify, or one that has expired
- **THEN** it is treated exactly as having no session at all

### Requirement: Signing out

An administrator SHALL be able to end their session, after which the administrative area is closed to them again.

#### Scenario: Signing out closes the area

- **WHEN** an administrator signs out and then requests an administrative page
- **THEN** they are redirected to sign-in as an unauthenticated visitor would be

#### Scenario: The session cookie is discarded

- **WHEN** an administrator signs out
- **THEN** the session cookie is cleared rather than left in the browser to expire on its own

### Requirement: Credentials never leave the server

The stored password hash MUST NOT appear in any response, and the session cookie MUST NOT be readable by page scripts.

#### Scenario: Identity of the signed-in administrator

- **WHEN** the signed-in administrator's identity is requested
- **THEN** the response carries the email only, and no password hash in any form

#### Scenario: Session cookie is not script-readable

- **WHEN** a page script reads the browser's cookies
- **THEN** the session cookie is absent, because it is marked httpOnly
