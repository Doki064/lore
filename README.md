# lore

A Claude Code plugin for knowledge transfer: capture tribal knowledge as a
byproduct of normal work, and serve it back **cited, scoped to what you're
touching, and staleness-checked** — at the moment it matters.

The name: the stuff that never makes it into docs — "don't run that migration
without draining the queue", "LegacyAuth exists because of the vendor bug" —
is *lore*. This plugin gives it a home in the repo, next to the code it
describes.

## What lore is

One note = one fact = one anchored markdown file in the target repo's
`.lore/` directory — versioned, greppable, and PR-reviewed like code. Notes
carry provenance, a verification baseline, and a `draft`/`confirmed` status;
there is no index and no external database. The `/lore:*` commands are
**prompt markdown** — the only runtime code is the tripwire hook (a
PreToolUse edit gate) and a one-line session-start awareness message. Scope
is deliberately single-repo.

**Who it's for.** Wikis rot, buddies have no bandwidth, and the knowledge
that burns new joiners is tacit: tripwires, the *why* behind weird code, who
to ask. Seniors won't write docs, but they will **react** — confirm a note
Claude drafted from their own session in seconds. New joiners won't read a
tour, but they will trust an answer that **cites a file/commit or admits
ignorance**, and that stops them *before* they edit a landmine.

## Install

```bash
claude plugin marketplace add Doki064/lore   # or a local checkout path
claude plugin install lore@lore
```

Restart Claude Code afterward — hooks load at session start. Notes live in
the **target repo's** `.lore/`, not this plugin's. See
[docs/EXAMPLE.md](docs/EXAMPLE.md) for an end-to-end walkthrough.

## Commands

| Surface | What it does |
|---|---|
| `/lore:ask` | Grounded Q&A from lore + code + git history. Every claim is cited; drafts and stale notes are labeled; the coverage header's counts are **derived from what the answer actually cites**, and it routes to a human when it doesn't know. |
| `/lore:capture` | Draft a note from the current session — dedup, anchor lint, redaction, then confirmed-or-draft by the trust rule. No-argument runs batch-triage up to 3 session facts, always written `draft`. Under 10 seconds of human time. |
| `/lore:mine` | Cold start: seed draft notes from reverts and incident commits, PR review threads (via `gh`), ADRs, and CODEOWNERS. A **write gate** renders every draft as exact file content and persists nothing until your explicit go-ahead; output begins at byte one with `1. Floor report.` |
| `/lore:onboard` | A brief scoped to the ticket in front of you — tripwires first, decision history, who to ask; writes nothing. An explicit whole-project ask enters **overview mode**: a fixed template of verbatim section headings plus an optional "getting hands-on" list of cited entry points. |
| `/lore:offboard` | Departing engineer: a bus-factor scan finds their solo areas, then an in-context interview drafts the notes before the knowledge walks out. |
| `/lore:verify` | Staleness/dispute sweep: re-confirm, update, or retire notes whose anchors changed, and promote vetted drafts. Renders sweep counts at sweep time and outcome counts only after the decisions are made. |
| **tripwire gate** (hook) | Editing a file guarded by a confirmed tripwire? The first edit attempt is denied once with the warning as the reason; the immediate retry passes. Once per note per session; stale notes re-alert once, labeled. |

## Trust contract

The [`using-lore`](skills/using-lore/SKILL.md) skill is the shared contract
every command invokes by name. In brief:

- **Drafts vs. confirmed.** A note is `draft` (Claude-drafted or unvetted)
  until an owner confirms it. Only a blame author or CODEOWNERS-listed owner
  can write `confirmed` (email-matched); only `confirmed` tripwires gate
  edits. `status:` is the only confirmation signal — batch capture and mining
  stay `draft` regardless of who ran them.
- **Staleness is always visible.** A note is stale when a file anchor changed
  since its `verified_sha`; an absent or unresolvable baseline reads as
  never-verified or stale, never fresh. Stale and draft notes are labeled
  every time they surface. No anchor, no trust.
- **Disputes.** Anyone can flag a note `disputed:` from `/lore:ask` — no
  owner rights needed — but the flag renders as a fixed-wording, git-attributed
  footnote that never reframes or suppresses a tripwire. Only an owner
  resolves it, via `/lore:verify` (disputes are swept first).
- **No compliance narration; list-first rendering.** A clean check produces
  no output — findings are rendered, compliance is not. Every slot in a pinned
  output renders only by iterating a non-empty findings list; sentence-form
  empty states ("none found", "no drift") are structurally out. An enumerated
  set of mandated attestations (coverage header, permission-degrade line,
  redaction report, and a few others) is the only exception.
- **Receipts-earned claims.** A claim of work renders only with a
  reader-falsifiable receipt. `+ N docs spot-checked` appears only when N
  per-doc receipt lines (`aligned` or `DOC DRIFT`) are present.

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

## Docs

- **[CHANGELOG.md](CHANGELOG.md)** — what changed in each version.
- **[docs/EXAMPLE.md](docs/EXAMPLE.md)** — end-to-end usage walkthrough.
