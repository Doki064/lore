# Changelog

All notable changes to the lore plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[SemVer](https://semver.org/). Each version's frozen design plan lives at
`docs/plans/VXX-PLAN.md`.

## [Unreleased]

- v0.4 planned, build not started — see `docs/HANDOFF.md` and
  `docs/plans/V04-PLAN.md`.

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
