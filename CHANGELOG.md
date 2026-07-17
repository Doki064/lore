# Changelog

All notable changes to the lore plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[SemVer](https://semver.org/).

## [Unreleased]

## [0.7.0] - 2026-07-17

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes,
zero new data-model fields. The fifth consecutive prompt/docs-only version.

Theme: **the decidability release** — every trust promise gradeable from the
output alone. A fresh two-model measurement round against the shipped v0.6
showed the structural rules held exactly where they are structural and
drifted where a promise still depended on judgment at render time: receipt
counts disagreeing with receipt lines, a real commit sha rendered as a
verification baseline in a session where git was blocked, and pinned
headings drifting by punctuation the contract itself rendered
inconsistently. v0.7 closes those gaps and adds no new surface.

### Changed
- **Doc-check receipts are derived from one list.** Every answer or brief
  composes its spot-check list first (one entry per doc checked); the
  receipt lines render only by iterating that list, and the
  `+ N docs spot-checked` count is the list's length. The count and the
  lines can no longer disagree, and receipts render only in the flags slot
  — never woven into body prose.
- **Blocked-git drafts are honest about their baseline.** When git could
  not run this session, a draft's `verified_sha` renders exactly
  `unresolvable (git unavailable this session)` — never a sha. A sha that
  didn't come from a git command executed this session (remembered from
  context, quoted in a doc, or supplied by the environment) is never a
  drafting baseline.
- **The mine write gate now explains itself.** If you ask mine to save
  before its review step has rendered, the review step says so in one fixed
  line — the instruction is deferred, not refused — instead of leaving the
  model to improvise an explanation the contract used to ban.
- **Verify categories no longer overlap on status.** `fresh` counts only
  confirmed notes whose anchors are unchanged; a draft is never fresh — it
  counts under still-draft.
- **Pinned literals are byte-exact, with a stated tolerance.** All heading
  and part-title literals are normalized to one exact string each (the
  contract's own text previously rendered some with trailing periods and
  some without), and one rule now defines "verbatim": exact byte string,
  surrounding markdown markers tolerated, changes inside the string not.
- The mandated-attestation list (the honest lines the no-narration rules
  must never suppress) grows from 10 to 12: onboard's mining-fallback
  "none" was always mandated but missing from the list, and the write-gate
  deferral line is new.

## [0.6.0] - 2026-07-16

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes,
zero new data-model fields.

Theme: **structure over vigilance**. Wording rules ("never say X") decay when
the model changes — the next model just rephrases the banned sentence. v0.6
makes those output classes impossible to render by shape instead: counts are
derived, headings are templates, empty slots disappear. Verified with live
two-model smokes on every changed surface and the hook suite green twice.

### Changed
- **`/lore:ask` — coverage counts and receipts are derived, not recalled.**
  The header's confirmed/draft/disputed counts include only the notes the
  answer actually cites by filename. `+ N docs spot-checked` equals the
  number of per-doc receipt lines rendered (`aligned` or `DOC DRIFT`); a doc
  that never sourced a code claim earns no receipt and no count.
- **`/lore:onboard` — overview headings are a verbatim template.** The six
  sections render as literal heading strings in a pinned order. A section
  with no findings drops its heading and body entirely; tripwires stay in
  section 4, never hoisted above orientation.
- **List-first rendering** (the `using-lore` skill): a slot in any pinned
  output renders only by iterating a non-empty findings list — zero items
  means no line, no heading, no sentence. Sentence-form empty states ("none
  found", "all N verified — none stale") are out across every surface. A
  short enumerated list of mandated attestations (the coverage header, the
  permission-degrade line, the redaction report, and a few others) is the
  only exception, so required honest lines never get suppressed.
- **`/lore:mine` starts at byte one.** The first rendered character is part
  1's heading `1. Floor report.` — no acknowledgments, no environment
  remarks, no preamble of any kind. Anything worth flagging renders inside
  its owning part.

### Deferred
- **Stronger capture nudges at session start.** One measured under-capture
  event wasn't enough to justify a hook change — especially since the
  minimal fix (a `/lore:capture` pointer at session start) already ships.
  Revisited if two or more further events show up.

## [0.5.0] - 2026-07-16

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes.

Theme: **earned claims and gated writes**. Field use showed surfaces without
a pinned output shape still narrating sources they never consulted, one model
writing drafts to disk without consent, and one model claiming doc
spot-checks its run never made.

### Added
- **`/lore:mine` write gate.** Mine renders drafts as exact file content but
  writes nothing until you explicitly approve after the closing review ask —
  a "save it" instruction given earlier doesn't count. The gate defers the
  write, never refuses it: an approved write must go through.
- **`/lore:verify` render skeleton.** Sweep items, a sweep-counts line, the
  pending decisions, then outcome counts — empty categories omitted instead
  of rendered as "0" lines. The interactive decision loop is untouched.
- **`/lore:onboard` render skeletons** for scoped and overview modes
  (tripwires always first, no step dropped), plus an optional
  **getting hands-on** list at the end of an overview: up to 5 cited
  entry-point artifacts, plain pointers only — no invented commands, no
  advice, no difficulty judgments.
- **`/lore:ask` confinement.** Step-shaped output (dispute footnotes,
  DOC DRIFT flags, doc receipts) renders only as flag lines after the answer
  body; a step that found nothing gets no line anywhere.

### Changed
- **Claims must carry receipts.** `+ N docs spot-checked` renders only when
  N per-doc receipt lines are present — the doc plus the concrete claim
  checked, each one reader-falsifiable. Who-to-ask is two-state: git
  authors, or a CODEOWNERS fallback that states why it fired. No state ever
  names a source that wasn't consulted.
- **Verify counts split by when their facts exist.** Sweep counts (fresh /
  stale / disputed / never-verified / retire-candidates / still-draft) at
  sweep time; outcome counts (re-confirmed / updated / retired / promoted /
  disputed-resolved / stale-disputes) only after the decisions are made. A
  session that ends early omits the outcome line rather than rendering
  zeros.
- **Ticket source demoted.** Mine no longer queries trackers at all, tool
  present or not. A ticket ID enters a note only when a commit message or PR
  body quotes it, recorded as a bare co-reference
  (`(also referenced by <TICKET-ID>)`). The ticket-text redaction rules
  stay, since pasted or quoted ticket content can still reach a note.

### Fixed
- Pre-release review caught the new verify skeleton rendering outcome counts
  as zeros before any decision had been made. Outcome counts moved to their
  own line after the decision asks, omitted entirely when the session ends
  first.

## [0.4.0] - 2026-07-15

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes.

Theme: honesty and contract robustness — every item hardens an existing
contract the evidence showed breaking, mostly when the model changed.

### Changed
- **`/lore:mine` output is a pinned five-part skeleton** (floor report,
  conditional-source findings, drafts shown as exact file content, a
  redaction line, closing ask), backed by a skill-wide rule against
  narrating compliance. Replaces "be silent about absent sources" prose,
  which did not survive a model swap.
- **Provenance is attempt-based.** The coverage header and the zero-note
  empty-state phrase distinguish git executed / attempted-and-denied /
  never attempted, and always flip together. Git history remains the
  default source for why/decision questions.
- **`verified_sha`/`verified_date` split semantics:** last human
  confirmation on a `confirmed` note, drafting baseline on a `draft` note —
  `status:` is the only confirmation signal. Mine stamps HEAD on every
  draft it presents.
- **Redaction reporting pinned:** categories + counts when stripping, a
  source pointer only when aborting — never the caught strings, never a
  category stapled to a nameable ticket or commit ID.
- **Mine's deterministic floor pinned:** any non-letter character is a word
  boundary (`hotfix_cicd` counts as a hotfix; `prefix` and `fixture` do
  not). The 5-draft cap gets a selection tiebreak (incidents first, then
  reverts and rationale-bearing decisions, then workarounds). A candidate
  whose "why" is already stated by an inline comment at the anchor is
  skipped, with a cited drop note — and when in doubt, drafted anyway.

### Added
- **Ticket co-references:** a ticket quoted in a commit or PR folds into the
  matching candidate's source line instead of drafting a duplicate note;
  shown to the owner at promotion.
- **A never-verified category in `/lore:verify`** for notes missing
  `verified_sha` entirely (legacy or hand-written notes) — rendered
  distinctly, never fresh, never confused with stale.

### Fixed
- Surfaces no longer narrate their own compliance — no "no drift found", no
  naming of absent tools or sources. The underlying checks still always run;
  only clean-result narration is suppressed.
- `/lore:mine` degrades under blocked git the way `/lore:ask` already did:
  one line names the gap, the floor enters its unavailable state, and the
  run continues on tree-readable sources instead of stalling to ask how to
  proceed.

## [0.3.0] — 2026-07-15

Prompt/docs-level release on the unchanged v0.2 runtime — zero hook changes.
Scope driven by the first real field data.

### Added
- **`/lore:onboard` overview mode**: entered only on an explicit
  whole-project ask, never inferred from breadth. Pinned section skeleton;
  any legacy-vs-current split is reported as cited migration events only —
  never completeness verdicts, percentages, or "X is legacy" claims.
- **DOC DRIFT flag** in `onboard`/`ask`: grep-verifiable divergences in
  prose docs get a fixed observation line — never interpretive claims,
  never a repo-wide audit. "STALE" stays reserved for note staleness.
- **Conditional ticket-tracker source** in `/lore:mine`: runs only when a
  tracker tool is verifiably present, silent otherwise, with extended
  redaction for ticket text and a hard rule against emitting IDs that
  didn't come from a tool result. (Demoted in 0.5.0.)
- **Permission-wall degradation**: blocked `git`/`gh` gets a one-line gap
  statement and an honest coverage header; lore never recommends allowlist
  entries or permission changes.
- Determinism pins: the onboard section skeleton, mine's found-or-none
  deterministic floor, and batch-picker counts derived from the enumerated
  list.

### Fixed
- `/lore:verify`: re-confirming or updating a disputed/stale note is now
  explicitly owner-gated — previously any user could clear a dispute.
- `/lore:offboard`: the trust rule is checked, never assumed, when the
  interview drifts outside the departing engineer's authorship.
- Overview orientation generalized beyond pipeline migrations.

## [0.2.0] — 2026-07-14

### Added
- **`disputed:` frontmatter field**: anyone can flag a note, only owners
  clear it (via `/lore:verify`, disputes swept first). Rendered everywhere
  as a fixed-wording subordinate footnote that never suppresses a tripwire;
  author and age are read live from git blame, never stored.
- **Batch capture**: no-argument `/lore:capture` triages up to 3 session
  facts; batch output is always `status: draft`.
- **Mining-first `/lore:onboard`**: zero note coverage triggers inline
  scoped mining, ephemeral, under a verbatim "unconfirmed guesses" frame.
  Every ask/onboard answer opens with a coverage header, including an
  explicit empty state.
- **Session-start awareness hook**: one pointer line into model context
  when `.lore/` has notes; silent otherwise.
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
- Zero-dependency hook test suite; runs on Node ≥16 + git.
