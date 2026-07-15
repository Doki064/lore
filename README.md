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
ignorance**, and that warns them *before* they edit a landmine.

## Core loop

1. **Capture** — during any session, `/lore:capture` (or a one-line prompt at
   review time) drafts a note from what just happened; the human confirms.
2. **Store** — notes are markdown files in `.lore/` of the target repo:
   versioned, greppable, PR-reviewable, anchored to code paths, with
   provenance and a `verified` commit.
3. **Recall** — a hook warns when you edit a file with a confirmed tripwire;
   `/lore:ask` answers questions grounded in lore + repo with citations;
   `/lore:onboard` scopes it to your first ticket.
4. **Trust** — `/lore:verify` flags notes whose anchors changed since last
   verification ("verify me", never silent staleness).

See [docs/plans/V01-PLAN.md](docs/plans/V01-PLAN.md) for the full design and build plan.

## Status

Pre-implementation. Design converged from a structured debate between
simulated new-joiner and senior-engineer panels, then hardened through
adversarial review rounds (see docs/plans/V01-PLAN.md). Scope is deliberately single-repo
for v1; cross-repo knowledge waits until the core loop is proven.
