# Changelog

All notable changes to the lore plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[SemVer](https://semver.org/). Each version's frozen design plan lives at
`docs/plans/VXX-PLAN.md`.

## [Unreleased]

## [0.6.0] - 2026-07-16

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes,
zero data-model field additions (the fourth consecutive prompt/docs-only
version). Theme: **structure over vigilance**. v0.4/v0.5 proved structural
output shapes survive a model swap where wording rules don't; the field then
showed the residual failures are all *phrase*-shaped — an exact-string ban
("no drift found", "Gaps: none") decays into a reworded paraphrase the next
model invents. v0.6 stops chasing phrases: where v0.5 banned strings, v0.6
makes the offending output class **unrenderable by shape**. Scope driven by the
v0.5 dogfood watchlist plus 16 live two-model sessions on final v0.5 bytes
(anonymized: no org/repo/ticket/person identifiers — two real local repos and a
12-note fixture). Verified with plugin-validator + skill-reviewer on final
bytes after every edit, a hostile prompt-review before tagging, live two-model
smokes (sonnet + a larger model) on every changed surface, and the hook suite
green twice in a row (hooks/tests untouched since v0.2).

### Changed
- **`/lore:ask` coverage header and receipts are now citation-derived** (D1;
  `ask.md` + the skill's coverage-header rule): after the answer body is
  composed, the N confirmed / M draft / J disputed counts cover only the notes
  the body **actually cites by filename** (a note read but not cited earns no
  count), and `+ N docs spot-checked` **equals the number of per-doc receipt
  lines rendered** — one receipt (`aligned` or a `DOC DRIFT` line) per doc
  spot-checked as the source of a claim **about code**; a non-code doc citation
  earns no receipt and no term. Amends the skill's "actually used"
  coverage-header rule to this decidable citation form (dual-maintained). The
  shipped step-4 (capture) and step-5 (dispute-raise) conditional closers are
  affirmed unchanged — only an unconditioned proactive tail is out.
- **`/lore:onboard` overview headings are now a verbatim template** (D2;
  `onboard.md`): the six sections render as **literal heading strings, in a
  pinned order** — coverage header, "Orientation — what the repo is", "Docs
  map", "Tripwires + relevant notes", "Decision history + who to ask", and the
  optional "Getting hands-on (optional) — entry points (cited; unverified as a
  sequence)". A heading renders **iff** its section's findings list is
  non-empty; an absent section omits heading and body entirely. Tripwires stay
  heading 4 (never hoisted above orientation); orientation keeps its specific
  "no migration evidence found for Z" line as a mandated exception, while the
  blanket absence form becomes structurally unrenderable.
- **List-first rendering discipline** (D3; the `using-lore` skill, one shared
  principle): a slot in any pinned skeleton renders **only by iterating a
  non-empty findings list** — zero items ⇒ no line, no heading, no sentence;
  sentence-form empty states ("none found", "no X this sweep", "all N verified
  — none stale") are structurally out, replacing the per-phrase bans they
  generalize. An enumerated **mandated-attestation exception list** (frozen in
  the plan, swept against the skill + ask/onboard/mine/verify) keeps every line
  a reader is genuinely owed — coverage-header empty states, the
  permission-degrade one-liner, the redaction report including its "nothing to
  strip" form, mine's floor "none", who-to-ask's CODEOWNERS-fallback trigger
  and "no ownership record" finding, orientation's specific absence line, and
  verify's sweep-counts / outcome-counts / per-note qualification-basis lines —
  so the cure does not invert into over-suppression.
- **`/lore:mine` output begins at byte one** (D4; `mine.md`): the first rendered
  character is part 1's literal heading `1. Floor report.`. Nothing precedes it
  — no acknowledgment of instructions, no environment or index remark, no meta
  comment (a "no preamble" remark is itself a preamble). Anything the run must
  flag (a suspicious index, a degrade, a stale-tool caveat) renders inside its
  owning part, never ahead of part 1.

### Deferred
- **SessionStart capture-pointer strengthening** (D5): watchlist item 8's gate
  opened (one confirmed capture under-trigger event, compounded by mine's blind
  spot to feature-shaped facts), but the "minimal strengthening" the party
  converged on **already ships** — `session_start.js` has pointed to
  `/lore:capture` since v0.2, and the under-trigger event occurred with that
  pointer live. Any real strengthening therefore exceeds pointer-minimal on n=1
  evidence against this project's highest change bar (hooks). Resolution: **no
  hook change in v0.6** (hook tests untouched, regression-only). Recorded for
  v0.7: the SessionStart-first ordering stays binding, the sharpened admission
  is **≥2 further under-trigger events**, the candidate shape is a newest-note
  recency cue on the existing pull-only pointer line, and UserPromptSubmit stays
  refused unless SessionStart provably cannot carry the signal.

## [0.5.0] - 2026-07-16

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes,
zero data-model field additions. Theme: **earned claims and gated writes**,
finishing the structural-honesty pass v0.4 began. The field showed every
surface that never got a pinned output shape still narrating unconsulted
sources, one model auto-writing drafts past the consent gate, and one model
rendering a `+ N docs spot-checked` assurance its own run hadn't earned. Scope
driven by the v0.4 dogfood watchlist plus field probes (anonymized: no
org/repo/ticket/person identifiers) on a real enterprise dbt monorepo with a
Rally-class tracker and two real local repos. Verified with hostile
prompt-review before tagging and live two-model smokes on final bytes.

### Added
- `/lore:mine` **write gate**: no `Write`/`Edit` of any `.lore/` path from run
  start until the user's explicit go-ahead after the part-5 present-for-review
  ask has rendered; a save instruction given *before* part 5 is not the
  go-ahead. The gate **defers** the write, never forbids it — the same-session
  approved write is legal and must not be refused. Part 3 becomes "Drafts
  (rendered, not written)"; part 5 names the two paths (go-ahead now / promote
  later via `/lore:verify` or PR), and over-cap leftovers vs. "considered, not
  drafted" render by whether the cap was actually exceeded.
- `/lore:verify`: its first pinned **render skeleton** — sweep items,
  sweep-counts line, pending-decision asks, then a separate outcome-counts
  line; empty categories are omitted, never rendered as a "0" line. The
  interactive re-confirm/update/retire/promote drive loop is untouched.
- `/lore:onboard`: pinned **render skeletons** for both scoped and overview
  modes (a rendering pin of the existing step semantics — tripwires first, no
  step dropped), plus a **getting-hands-on** overview tail: an optional final
  part of ≤5 cited entry-point artifacts (manifest/CI/Make-class files, the
  tests directory, the docs index) under the fixed frame "entry points (cited;
  unverified as a sequence)" — noun-phrase pointers only, no invented commands,
  no advice or difficulty judgments; no citable artifacts ⇒ no part.
- `/lore:ask`: a **confinement clause** — step-shaped output (unknowns routing,
  dispute footnotes, DOC DRIFT flags, doc receipts) renders only as flag lines
  after the answer body, one per line; a step that found nothing gets no line
  anywhere.

### Changed
- **Earned-claim guard** (`/lore:onboard` + the `using-lore` skill): a claim of
  work renders only with its receipts. `+ N docs spot-checked` renders iff the
  risk-flags slot carries a per-doc receipt line — the doc plus the concrete
  claim/symbol grain actually checked, either "aligned" or a `DOC DRIFT` line —
  reader-falsifiable; no receipts ⇒ no term. who-to-ask is now **two-state** (a
  git-author path, or a CODEOWNERS-fallback path that states its trigger); no
  third state names an unconsulted source.
- **`/lore:verify` summary split into two count lines** by when their facts
  exist: sweep counts (fresh / stale / disputed / never-verified /
  retire-candidates / still-draft) at sweep time, outcome counts (re-confirmed
  / updated / retired / promoted / disputed-resolved / stale-disputes) only
  after the step 2–4 decisions — a session that ends before them omits the
  outcome line rather than render zeros the loop didn't produce.
- **Ticket source demoted from active mining** (`/lore:mine`): mine performs no
  tracker queries and no project discovery, tracker tool present or not (the
  v0.3 conditional ticket-tracker source is removed). Ticket IDs enter a note
  only as bare co-references quoted in a commit message or PR body
  (`(also referenced by <TICKET-ID>)`) — the fold relocated onto git history
  (source 1). The ticket/tracker redaction clause stays in the skill:
  `/lore:capture` can meet pasted ticket text, and commit/PR text can quote
  ticket content with names.

### Fixed
- Hostile prompt-review before tagging caught a fabricated-counts bug in the
  new `/lore:verify` skeleton (H1): outcome counts placed at sweep time would
  have rendered as zeros the decision loop hadn't yet produced — moved to their
  own line after the decision asks, omitted entirely when the session ends
  first.

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
