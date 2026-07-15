# Changelog

All notable changes to the lore plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[SemVer](https://semver.org/). Each version's frozen design plan lives at
`docs/plans/VXX-PLAN.md`.

## [Unreleased]

## [0.4.0] - 2026-07-15

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes,
zero data-model field additions. Theme: honesty and contract robustness —
every item hardens an existing contract the evidence showed breaking, mostly
under a model swap. Scope driven by the v0.3 dogfood watchlist plus scripted
fixture probes and field probes on a real enterprise repo session
(anonymized: no org/repo/ticket/person identifiers).

### Changed
- `/lore:mine`'s output is now a pinned five-part skeleton (floor report,
  conditional-source findings, drafts shown as exact file content, a
  `redaction pass: …` line, closing ask), backed by a skill-wide
  no-compliance-narration rule — replaces "be silent about absent sources"
  prose, which did not survive a model swap.
- Coverage-header git provenance and the zero-note empty-state phrase are
  now **attempt-based** (executed / attempted-and-denied / never attempted),
  flipping together; a `+ N docs spot-checked` term renders when doc-drift
  spot-checks actually ran on cited docs. Git history remains the default
  source for why/decision questions.
- `verified_sha`/`verified_date` field semantics are rewritten to a split
  form: last human confirmation on a `confirmed` note, drafting baseline on
  a `draft` note — `status:` is the only confirmation signal. `/lore:mine`
  stamps HEAD on every draft it presents.
- Redaction reporting, everywhere it runs, is pinned to categories+counts on
  the strip path and a source-pointer-only citation on the abort path —
  never the caught strings, never a category stapled to a nameable
  ticket/commit ID.
- Mine's deterministic-floor tokenization is pinned (any non-letter
  character is a word boundary — `hotfix_cicd` counts, `prefix`/`fixture` do
  not) and its ≤5-draft cap gets a one-line selection tiebreak (incidents
  and outages first, then reverts and rationale-bearing why/ADR decisions
  with a reserved slot, then workarounds); a candidate whose why is already
  stated by an inline comment at the anchor is skipped, with a
  when-in-doubt-draft guard and a cited drop note.

### Added
- `/lore:mine`: a mappable ticket that lands on an existing git-sourced
  candidate's artifact or path folds in as a bare co-reference
  (`(also referenced by <TICKET-ID>)`) instead of drafting a second note;
  shown to the owner at promotion.
- `/lore:verify`: a **never-verified** sweep category for notes missing
  `verified_sha` entirely (legacy or hand-written notes) — rendered
  distinctly, never fresh, never confused with the tripwire hook's own
  stale-coercion on unresolvable shas.

### Fixed
- Surfaces no longer narrate their own compliance — no "no drift found", no
  naming of absent tools/sources, no meta-notes about rules being followed.
  Findings are output; the underlying checks still always run, only their
  clean-result narration is suppressed.
- `/lore:mine` degrades under blocked git the way `/lore:ask` already did:
  previously it stalled with a stray irrelevant tool call and asked how to
  proceed; now it says so in one line, the floor enters its unavailable
  state, and it continues on tree-readable sources without asking.

## [0.3.0] — 2026-07-15

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook
changes. Scope driven by the first real field data (an anonymized dogfood
session on a data-platform migration repo plus five live watchlist probes).

### Added
- `/lore:onboard` **overview mode**: explicit whole-project ask only, never
  inferred from breadth; pinned 5-section skeleton; any legacy-vs-current
  split reported as cited migration events only — never completeness
  verdicts, percentages, or "X is legacy" claims; bounded mining when
  `.lore/` has fewer than 3 notes; ephemeral.
- **DOC DRIFT flag** in `onboard`/`ask`: grep-verifiable divergences in
  prose docs get a fixed observation line; never interpretive claims, never
  a repo-wide audit; "STALE" stays reserved for note staleness.
- **Conditional ticket-tracker source** in `/lore:mine` (Jira/Rally/similar
  via session MCP tools): runs only when the tool is verifiably present,
  silent otherwise; anchor-or-drop; landed-artifact preference; git
  hard-facts keep priority within the 5-draft cap; extended redaction for
  ticket text; anti-confabulation bar (never emit an ID not from a tool
  result).
- **Permission-wall degradation**: blocked `git`/`gh` ⇒ one-line gap
  statement, degrade to tree+notes, honest coverage header; lore never
  recommends allowlist entries or permission changes.
- Determinism pins: onboard section skeleton, mine's found-or-none
  deterministic floor (whole-word keyword matching), batch-picker counts
  derived from the enumerated list.

### Fixed
- `/lore:verify`: dispute/stale re-confirm and update are now explicitly
  owner-gated (write-side trust rule) — previously any user could clear a
  dispute, contradicting the data model.
- `/lore:offboard`: the trust rule is checked, never assumed, when the
  interview drifts outside the departing engineer's authorship.
- Overview orientation generalized beyond pipeline migrations (domain leak
  from the evidence session).

## [0.2.0] — 2026-07-14

### Added
- **`disputed:` frontmatter field**: anyone flags a note, only owners clear
  it (via `/lore:verify`, disputes swept first, ~90-day decay flag);
  rendered everywhere as a fixed-wording subordinate footnote that never
  suppresses a tripwire; author/age read live from git blame, never stored.
- **Batch capture**: no-arg `/lore:capture` triages up to 3 session facts;
  batch output is always `status: draft`.
- **Mining-first `/lore:onboard`**: zero note coverage ⇒ inline scoped
  mining, ephemeral, under the verbatim "unconfirmed guesses" frame;
  coverage header + explicit empty-state line on every ask/onboard answer.
- **Session-start awareness hook**: one pointer line into model context via
  `additionalContext` when `.lore/` has notes; silent otherwise.
- Retire-candidate detection in `/lore:verify` (file anchor gone from the
  tree); hook tests (i)–(m).

## [0.1.0] — 2026-07-14

Initial release: the trust-complete capture/recall loop.

### Added
- `.lore/` data model: one note = one fact = one anchored markdown file;
  provenance (`source`), staleness (`verified_sha`), `draft`/`confirmed`
  lifecycle, email-matched write-side trust rule.
- Six commands: `/lore:capture`, `/lore:ask`, `/lore:mine`, `/lore:verify`,
  `/lore:onboard`, `/lore:offboard`.
- `using-lore` skill: the shared trust contract every command invokes by
  name.
- Tripwire hook: PreToolUse **deny-once gate** (marker persisted before the
  deny so the retry passes; every failure path exits 0), per-uid dedupe,
  STALE re-alerting on state change.
- Zero-dependency hook test suite; runs on Node ≥16 + git (bash+jq original
  ported to Node in the same release cycle).
