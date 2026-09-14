---
paths:
  - "openspec/**"
---

# OpenSpec workflow

**Scope:** How a behaviour change enters this repo — proposal, specs, design, tasks, archive. It governs the documents, not the code those documents produce; the other rule files govern the code.

## Rules

1. Start every behaviour change as an OpenSpec proposal rather than as code, because a change no one can read before it is built is a change no one can review.
2. Produce artefacts in the order `proposal.md` → `specs/<capability>/spec.md` → `design.md` → `tasks.md`, since each is the input to the next: the proposal is _why_, the specs are _what_, the design is _how_, the tasks are _in what order_.
3. Name capabilities in kebab-case with exactly one `specs/<capability>/spec.md` each, so a reader finds a single authoritative description of a behaviour instead of reconciling two.
4. Write requirements as `### Requirement: <name>` phrased with SHALL or MUST, because a requirement worded as a suggestion cannot be failed by a test.
5. Write scenarios as `#### Scenario: <name>` with exactly four hashtags and `- **WHEN**` / `- **THEN**` bullets — three hashtags parse as prose, and the scenario then vanishes silently with no error.
6. Give every requirement at least one scenario and cover the failure or edge case, not only the happy path, since every guarantee this project is graded on lives on the failure path.
7. Copy the ENTIRE requirement block — heading, prose and every scenario — into `## MODIFIED Requirements` before editing it, because the archiver replaces the original wholesale and whatever you did not copy is lost without warning.
8. Give each entry under `## REMOVED Requirements` both a `**Reason**` and a `**Migration**` line, so a later reader learns why the behaviour went and what callers should do instead.
9. Run `npm run spec:validate` (`openspec validate --all --strict`) before archiving, because the archiver trusts the document structure and will not tell you what it silently dropped.
10. Implement from `tasks.md`, ticking `- [ ] X.Y` checkboxes in exactly that form — the file is parsed, so a task written any other way is invisible to progress tracking.
11. Archive with `openspec archive <change>` and never hand-edit the generated `openspec/specs/**`; a hook blocks it, because those files are output and any edit there is overwritten by the next archive.
12. Replace the `TBD -` stub the archiver leaves under `## Purpose` with a real sentence, since a stale TBD is a documentation bug written into the permanent specs.
13. Act on whatever the docs-sync hook reports after an archive instead of moving past it, because its findings are stale-documentation defects that only get harder to place later.

## Examples

```md
<!-- no: three hashtags, so this scenario is parsed as prose and disappears -->

### Scenario: Draft requested by direct URL

<!-- yes: requirement in SHALL form, scenario at four hashtags, failure path covered -->

### Requirement: Draft products are not publicly readable

The public catalogue SHALL expose only products whose status is PUBLISHED.

#### Scenario: Draft requested by direct URL

- **WHEN** an unauthenticated visitor requests a DRAFT product by its slug
- **THEN** the response is a 404 indistinguishable from that of a nonexistent slug
```

```bash
# no: archiving unvalidated hides structural mistakes in the generated specs
openspec archive edit-product-seo

# yes
npm run spec:validate
openspec archive edit-product-seo
```

## Anti-patterns

- Writing the code first and backfilling a proposal to match it, which makes the spec a transcript rather than a decision.
- A requirement with only a happy-path scenario, leaving the unauthorised and invalid cases unspecified and therefore untested.
- Abbreviating a modified requirement to just the lines that changed, silently deleting its other scenarios at archive time.
- Editing `openspec/specs/**` by hand to "fix" a wording problem instead of fixing the change that generated it.
- Tracking progress in prose or a side note rather than in `tasks.md` checkboxes, so tooling reports a change as untouched.
