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
| `/lore:mine` | Cold start: seed draft notes from reverts, incident commits, PR review threads (via `gh`), ADRs, CODEOWNERS. |
| `/lore:verify` | Staleness sweep: re-confirm / update / retire notes whose anchors changed; promote vetted drafts. |
| `/lore:onboard` | New joiner: a brief scoped to the ticket in front of you — tripwires first, decision history, who to ask. Not a wiki tour. |
| `/lore:offboard` | Departing engineer: bus-factor scan finds their monopolies, then an in-context interview drafts the notes before the knowledge walks out. |

## Trust model (the short version)

One note = one fact = one markdown file in `.lore/`, anchored to code paths,
with provenance (`source`), a verification commit (`verified_sha`), and a
status (`draft`/`confirmed`). No anchor, no trust. Only owners (blame
authors / CODEOWNERS) can confirm; only confirmed tripwires gate edits;
anything unverifiable is labeled, never asserted. Staleness is always
visible — an unresolvable `verified_sha` counts as stale, never fresh.

## Status

v0.1.0 — **built and live-verified**: hook test suite green
(`tests/hook_test.sh`, 8 asserts), plugin-validator PASS, and the full loop
(tripwire gate firing pre-edit, natural retry, cited `/lore:ask` answers
with staleness caveats) exercised in real `claude -p` sessions.

Design provenance: converged from structured debates between simulated
new-joiner and senior panels, hardened through two adversarial review
rounds, built by Opus under gatekept phase reviews — see [docs/plans/V02-PLAN.md](docs/plans/V02-PLAN.md).
Scope is deliberately single-repo for v1.
