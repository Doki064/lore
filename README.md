# lore

A Claude Code plugin for knowledge transfer: capture tribal knowledge as a
byproduct of normal work, and serve it back **cited, scoped to what you're
touching, and staleness-checked** — at the moment it matters.

The name: the stuff that never makes it into docs — "don't run that migration
without draining the queue", "LegacyAuth exists because of the vendor bug" —
is *lore*. This plugin gives it a home in the repo, next to the code it
describes.

## Why (the one-paragraph pitch)

Wikis rot, buddies have no bandwidth, and the knowledge that actually burns
new joiners is tacit: tripwires, the *why* behind weird code, who to ask.
Seniors won't write docs, but they will **react**: confirm a note Claude
drafted from their own session, in under ten seconds. New joiners won't read
a tour, but they will trust an answer that **cites a file/commit or admits
ignorance**, and that stops them *before* they edit a landmine.

## Install

```bash
claude plugin marketplace add ~/projects/lore   # or the repo URL
claude plugin install lore@lore
```

Restart Claude Code (hooks load at session start). Notes live in the
**target repo's** `.lore/` directory — versioned, greppable, PR-reviewed
like code. See [docs/EXAMPLE.md](docs/EXAMPLE.md) for an end-to-end
walkthrough.

## What you get

| Surface | What it does |
|---|---|
| `/lore:capture` | Draft a note from the current session; dedup, anchor lint, redaction, then confirmed-or-draft by the trust rule. Under 10 seconds of human time. |
| **tripwire gate** (hook) | Editing a file guarded by a confirmed tripwire? The first edit attempt is stopped once, with the warning as the reason; the immediate retry passes. Once per note per session; stale notes re-alert once, labeled. |
| `/lore:ask` | Grounded Q&A: answers from lore + code + git history, every claim cited, drafts and stale notes labeled, routes to a human when it doesn't know. |
| `/lore:mine` | Cold start: seed draft notes from reverts, incident commits, PR review threads (via `gh`), ADRs, CODEOWNERS. Drafts are rendered as exact file content and written only on your go-ahead; ticket IDs appear only as bare co-references quoted from commit/PR text (mine runs no tracker queries). |
| `/lore:verify` | Staleness sweep: re-confirm / update / retire notes whose anchors changed; promote vetted drafts. |
| `/lore:onboard` | New joiner: a brief scoped to the ticket in front of you — tripwires first, decision history, who to ask. Not a wiki tour. |
| `/lore:offboard` | Departing engineer: bus-factor scan finds their monopolies, then an in-context interview drafts the notes before the knowledge walks out. |

## What's new in v0.2

Same trust rules, four additions. Anyone can flag a note `disputed:` from
`/lore:ask` — no owner rights required — but the warning never disappears or
reframes itself: it's footnoted, git-attributed, and resolved later by an
owner via `/lore:verify` (disputes are swept first, ahead of staleness).
`/lore:capture` with no arguments triages up to 3 durable facts from the
current session at once; batch-picked notes always land as `status: draft`
— triage speed never buys `confirmed`. `/lore:onboard` on an area with zero
`.lore/` coverage mines git history inline instead of coming up empty,
clearly framed as unconfirmed guesses to confirm with an owner. And every
session opens with one silent context line naming what's in `.lore/` and how
to ground answers in it — no nudges, no per-person state, nothing at all in
a repo with no lore.

## What's new in v0.3

Prompt/docs-level only — no runtime or hook changes. `/lore:onboard` gains an
**overview mode**, triggered only by an explicit whole-project ask ("give me
an overview", "the whole project/repo") — a merely broad area name still
takes the scoped path, which stays the default. Overview mode assembles a
pinned brief: coverage header, an orientation that cites migration events
where the repo shows one (never a completeness verdict or a percentage —
absence of evidence is stated as "no migration evidence found for X", not "X
is legacy"), a docs map that names and cites entry-point docs without
reproducing them, then tripwires/notes and decision history/who-to-ask as
usual. Both `/lore:onboard` and `/lore:ask` now flag **doc drift**: when a
brief or answer cites a human doc for a claim about code, it spot-checks that
claim and, on a grep-verifiable divergence only (a symbol/path/command that no
longer exists), emits a fixed one-line observation — never an assertion that
the doc is wrong, and never a repo-wide audit. "STALE" stays reserved for
git-deterministic note staleness; doc drift is separate. `/lore:mine` gains a
conditional last source: when a ticket-tracker tool (Jira/Rally/similar) is
present in the session, it mines incident/decision language from tickets
too, applying an extra redaction pass for assignee/reporter/commenter names
and status politics; when no such tool is present, this source is skipped
silently — no ticket is ever mentioned. And every surface now degrades
honestly under a permission wall: if `git`/`gh` calls come back blocked, lore
says so in one line, falls back to what Read/Grep and `.lore/` can tell it,
and labels the gap in the coverage header — it never recommends an allowlist
entry or permission change to unblock itself (see "Locked-down
environments" below).

## What's new in v0.4

Prompt/docs-level only — no runtime or hook changes. `/lore:mine`'s report
is now a fixed five-part shape: what the deterministic floor found (or
didn't), findings from whichever conditional sources actually ran this
session, every draft shown as the exact file content it would write, a
`redaction pass: …` line whenever external text (PR/ticket/ADR quotes) was
processed, then the closing write-or-not ask. A ticket that corroborates an
existing git-sourced candidate no longer drafts a second note — it folds
into the git draft's `source:` line as `(also referenced by <TICKET-ID>)`.
Redaction reporting is pinned everywhere it runs: a strip states categories
and counts only, never the caught strings; an abort names the source
pointer only, never the triggering text next to a nameable ticket/commit
ID. `/lore:ask` and `/lore:onboard`'s coverage header is now
**attempt-based** about git — it reads differently depending on whether git
executed, was attempted and denied, or was never needed for that answer,
and the empty-state phrase always flips with it — plus a `+ N docs
spot-checked` term whenever a doc-drift spot-check actually ran on a cited
doc. `/lore:verify` gains a **never-verified** sweep category for notes
that have no `verified_sha` baseline at all (legacy or hand-written notes),
distinct from both fresh and stale.

## What's new in v0.5

Prompt/docs-level only — no runtime or hook changes. Theme: **earned claims
and gated writes** — every surface that never received an output shape had
regressed into narrating work it didn't do, and one model auto-wrote drafts
past the consent gate. Five changes, each receipt-backed by field evidence:
- `/lore:mine` gains a **write gate**: it renders every draft as exact file
  content and calls no `Write`/`Edit` on any `.lore/` path until your explicit
  go-ahead after the closing present-for-review ask. The gate defers the write,
  it doesn't forbid it — the same-session approved write is legal and never
  refused. Part 3 is now "Drafts (rendered, not written)"; the closing names
  the two real paths (go-ahead now / promote later via `/lore:verify` or PR).
- **Earned-claim guard** in `/lore:onboard` and the skill: a claim of work
  renders only with its receipts. `+ N docs spot-checked` appears only when the
  risk-flags slot carries a per-doc receipt line — the doc plus the exact
  claim/symbol checked, either "aligned" or a `DOC DRIFT` line — and who-to-ask
  is **two-state** (a git-author path, or a CODEOWNERS-fallback path that states
  its trigger), with no third state that names an unconsulted source.
- **Pinned render skeletons** for the surfaces that never had one: `/lore:verify`
  gets its first (sweep counts rendered at sweep time; outcome counts only after
  the promote/dispute decisions are made — never zeros the loop didn't produce);
  `/lore:onboard`'s scoped and overview modes get a rendering pin of their
  existing steps (tripwires still first); and `/lore:ask` gains a confinement
  clause keeping step-shaped output (unknowns routing, dispute footnotes,
  DOC DRIFT, doc receipts) to flag lines after the answer body.
- **Ticket source demoted from active mining**: `/lore:mine` runs no tracker
  queries and no project discovery, tracker tool present or not. Ticket IDs
  reach a note only as bare co-references quoted in a commit message or PR body
  (`(also referenced by <TICKET-ID>)`) — the fold relocated onto git history,
  where the IDs actually arrive. The ticket/tracker redaction pass stays, since
  `/lore:capture` and PR/commit text can still carry ticket content.
- **Getting-hands-on tail** on the onboard overview: an optional final part
  listing ≤5 cited entry-point artifacts (build/test/run files from the
  manifest/CI/Make-class tree, where tests live, the docs index) under a fixed
  "entry points (cited; unverified as a sequence)" frame — noun-phrase pointers
  only, no invented commands, no advice or difficulty judgments. No citable
  artifacts ⇒ no part.

## Locked-down environments

lore's commands read `git`/`gh` at runtime — that's how citations, blame,
and staleness get computed. In a locked-down environment where those calls
are blocked, lore states the gap in one line and degrades to what it can
still do: reading the tree and `.lore/` notes directly.

Whether to grant lore's commands broader `git`/`gh` access is a security
decision for you or your admin, not lore's to make. Prefer the narrowest
scoping that unblocks the specific call that's failing — a broad `git:*` or
`gh:*` allowlist entry widens the execution surface for everything in the
session, not just lore. **Lore does not recommend specific allowlist
entries**, on this or any point.

Two classes of blocker exist that no allowlist entry fixes, and lore cannot
work around either — naming them so you recognize the symptom instead of
chasing a permissions fix that won't land:
- **Prompt-gate hooks** that reject slash-command submissions outright,
  before the command ever runs.
- **Command-rewriting hooks** that rewrite the command lore issues, so an
  allowlist rule written against the original command misses the rewritten
  one.

In both cases lore degrades the same way: one line naming what's blocked,
then tree+notes only.

## Trust model (the short version)

One note = one fact = one markdown file in `.lore/`, anchored to code paths,
with provenance (`source`), a `verified_sha` (last human verification on a
`confirmed` note; the drafting baseline on a `draft` note — `status:` is
the only confirmation signal), and a status (`draft`/`confirmed`). No
anchor, no trust. Only owners (blame authors / CODEOWNERS) can confirm;
only confirmed tripwires gate edits; anything unverifiable is labeled,
never asserted. Staleness is always visible — an unresolvable or missing
`verified_sha` counts as stale (or, if absent entirely, **never-verified**),
never fresh.

## Status

v0.5.0 — prompt/docs-level release on top of the v0.2 runtime (no hook or
test changes since v0.2; the hook suite is a regression guard only, green
twice in a row). v0.2's live verification stands: hook test suite green twice
in a row (`tests/hook_test.js`, 13 asserts), plugin-validator PASS, and the
v0.2 surfaces exercised in real `claude -p` sessions: the session-start
awareness line reaching model context with correct counts, a disputed
tripwire denying once with the dispute footnoted (never reframed) then passing
on retry, and mining-first `/lore:onboard` producing a cited, zero-write brief
on a repo that had never seen lore. v0.5's newly-pinned surfaces were
live-smoked on final bytes across **two models** (sonnet + a larger model):
mine's write gate (no `.lore/` file written before the go-ahead; the approved
write then landing byte-for-byte the rendered content), the earned-claim guard
(`+ N docs spot-checked` present only with its per-doc receipts, DOC DRIFT
still firing on seeded drift), two-state who-to-ask, verify's split
sweep/outcome counts, and the onboard getting-hands-on tail. A hostile
prompt-review before tagging caught a fabricated-counts bug in the verify
skeleton (outcome counts must render only after the decisions, never as
sweep-time zeros).

Design provenance: each milestone converged from structured debates between
simulated new-joiner and senior panels, hardened through adversarial review
(implementer cold-reads + product red-teams), built under gatekept phase
reviews — see [docs/plans/V05-PLAN.md](docs/plans/V05-PLAN.md). Scope is deliberately single-repo.
