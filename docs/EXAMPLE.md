# lore by example

A worked example of the full loop on a fictional repo, `payments/`. Every
command shown is real; the outputs are abridged.

## 0. Install (once)

```bash
claude plugin marketplace add Doki064/lore
claude plugin install lore@lore
# restart Claude Code — hooks load at session start
```

## 1. Cold start: seed notes from history

In a Claude Code session inside `payments/`:

```
> /lore:mine
```

Claude scans git history (reverts, incident/hotfix commits), merged-PR
review threads (when `gh` is available), ADR directories, CODEOWNERS, and —
only when the session actually has a ticket-tracker tool (Jira/Rally via
MCP) — incident/decision tickets. An absent source leaves no trace: no
"skipped" line, no ticket ever mentioned without the tool. Up to 5 **draft**
candidates come back for review:

> **Source 1 — git history (exhaustive):** 1 revert, 1 hotfix commit.
> **Source 3 — ADRs:** none (`docs/adr/` has only accepted-and-current
> decisions). Sources 2/4 had nothing durable.
>
> 1. tripwire — anchors: `src/billing/export.py` — commit `a1b2c3d`
>    reverted an eager-export change; message cites wrong totals when the
>    export ran before dispute finalization.
> 2. why — anchors: `src/refunds/vendor.py` — hotfix `e4f5a6b`: "export
>    retried too aggressively, vendor started rate-limiting us."
>
> Write these to `.lore/` as drafts?

Nothing is written without your go-ahead, and nothing mined is ever
auto-confirmed. Note the shape: every candidate cites a sha you can
`git show`, phrased as what the commit *did* — never as what "the team
decided."

## 2. Capture a tripwire the moment it comes up

A senior explains in review: "never remove the `*2` in `charge()` — it
compensates a vendor rounding bug." That knowledge usually evaporates.
Instead:

```
> /lore:capture the *2 in charge() must stay
```

Claude drafts the note, checks for an existing note on the same anchors,
lints the anchors, runs the redaction checklist, and — because the senior
is a blame author of `src/pay.py` — writes it as `confirmed`:

```markdown
# .lore/tripwire-pay-double-charge.md
---
kind: tripwire
anchors:
  - src/pay.py
source: incident 2025-11-03
verified_sha: 65fad85
verified_date: 2026-07-14
status: confirmed
confirmed_by: jane
---
Never remove the *2 in charge() — it compensates a vendor rounding bug;
removing it double-charges customers on retries.
```

The note rides the normal PR into `main`. Total senior time: ~10 seconds.

## 3. Batch capture: triage a whole session at once

Later in the same session, after debugging a flaky refund test and hearing
an explanation of why `RefundQueue` polls instead of using a webhook:

```
> /lore:capture
```

No arguments — Claude scans the session instead of one fact, drops anything
already covered in `.lore/`, and presents a numbered list:

```
1. why — anchors: src/refunds/queue.py — RefundQueue polls because the
   vendor's webhook silently drops retries under load (from this session's
   debugging of the flaky test, see the trace above)
2. tripwire — anchors: src/refunds/retry.py — retrying a refund within 60s
   of the last attempt double-submits to the vendor (incident just now)

Pick a number, several, `all`, or `none`.
```

```
> all
```

Both run the normal draft → dedup → anchor lint → redaction steps — but
**always land as `status: draft`**, even though the same senior is a blame
author of both files. Batch triage isn't confirmation; these two wait for
`/lore:verify` to be promoted one at a time.

## 4. The tripwire fires — at the moment of danger

Weeks later, a new joiner (or their Claude) opens the repo. Their session
starts with one line of context — lore's only proactive surface besides the
tripwire itself:

```
lore: 3 note(s) (1 confirmed tripwire(s)) in .lore/. Ground answers in
them: /lore:ask <question>, /lore:onboard <area>. Capture new durable
facts with /lore:capture.
```

(A repo with no `.lore/` notes hears nothing at all.) Then they edit
`src/pay.py`. The first edit attempt is stopped **once**, with the warning
as the reason:

```
TRIPWIRE for src/pay.py (.lore/tripwire-pay-double-charge.md, confirmed
by jane on 2026-07-14): Never remove the *2 in charge() — it compensates
a vendor rounding bug; removing it double-charges customers on retries.

(lore tripwire gate: warning delivered, marker set — retry the same edit
now and it will go through.)
```

The retry passes. One warning per note per session — repeat edits stay
silent. If `src/pay.py` has changed since the note was verified, the
warning re-alerts once with a `STALE — verify before trusting:` prefix.

## 5. Ask, and get cited answers

```
> /lore:ask why does charge() multiply by 2?
```

> grounded in: 1 confirmed + 0 draft notes (0 disputed) + git history
>
> - `src/pay.py:2` — `return amount * 2  # retry-safe`
> - Note `.lore/tripwire-pay-double-charge.md` (status: **confirmed**,
>   verified 2026-07-14 at `65fad85`): compensates a vendor rounding bug…
>
> Staleness: anchor unchanged since verification.

The first line is the coverage header — at a glance, how much of the answer
is team-verified versus inferred. Unknown answers are never invented —
Claude says "I don't know" and routes you to the recent blame authors (or
CODEOWNERS), then offers `/lore:capture` once the human answers, so it's
only worked out once.

### Disputing a note

A new joiner reads the tripwire above and pushes back — the vendor rounding
bug was fixed in PR #700, months after the note was confirmed:

```
> /lore:ask does charge() still need the *2?
```

> `.lore/tripwire-pay-double-charge.md` (status: **confirmed**, verified
> 2026-07-14 at `65fad85`): Never remove the `*2`... compensates a vendor
> rounding bug.
>
> That contradicts PR #700, which the vendor merged 2026-06-01 — worth
> flagging?

```
> yes, PR #700 fixed it
```

Claude adds one line to the note's frontmatter — `disputed: PR #700 (merged
2026-06-01) fixed the vendor rounding bug; *2 may no longer be needed` — and
nothing else. `status:` stays `confirmed`, the body stays untouched, and the
tripwire keeps firing: the next edit to `src/pay.py` still shows the full
warning, with the hook's author-free footnote appended —
`(Unresolved reader dispute on file — not owner-verified: "PR #700 (merged
2026-06-01) fixed the vendor rounding bug; *2 may no longer be needed". An
owner resolves it via /lore:verify.)` — the warning itself is never
reframed. In `/lore:ask`, `/lore:onboard`, and `/lore:verify`, the same
dispute renders with its author and age read live from git blame:
`⚠ unresolved dispute (newjoiner, 2026-07-14 — not owner-verified): …`.
An owner resolves it, not the disputer.

## 6. Keep it trustworthy

```
> /lore:verify
```

Sweeps every note in order: **disputed notes first**, then staleness, then
draft promotion.

The disputed tripwire from above surfaces first, with the disputer, the
dispute's age, and what changed in `src/pay.py` since `verified_sha`. Jane
(a blame author) checks PR #700, agrees it's dead, and picks **retire** —
the file is deleted and the dispute goes with it. Had she disagreed, she'd
pick **re-confirm** instead, which clears the `disputed` line and bumps
`verified_sha` without touching the body.

Resolving disputes is an owner action: had `newjoiner` run the sweep
instead, Claude would name who qualifies (blame authors / CODEOWNERS of
`src/pay.py`) and leave the dispute standing.

Then the sweep continues: remaining stale notes ⇒ walk through
**re-confirm / update / retire**. Last, draft promotion — the two batch
drafts from §3 come up. Jane vouches for the `RefundQueue` why-note; her
email matches blame on `src/refunds/queue.py`, so it flips to
`confirmed_by: jane` with a fresh `verified_sha`. She isn't sure the 60s
retry window is still right, so that one stays `draft` for whoever owns
`retry.py`. Two more flags surface automatically in the same sweep: a
runbook anchored to a file deleted last quarter is marked a **retire
candidate** (the code the fact describes is gone), and a dispute nobody has
touched in over 90 days gets "stale dispute — resolve it or it is noise."
The summary counts it all: fresh / re-confirmed / promoted / still-draft,
disputed-resolved, stale-disputes, retire-candidates.

## 7. People flows

- New joiner, first ticket: `/lore:onboard PAY-123 refund flow` → a brief
  scoped to that work — tripwires first, decision history, who to ask.
- Someone leaving: `/lore:offboard` → bus-factor scan finds the areas only
  they ever touched, then an in-context interview drafts the notes before
  the knowledge walks out the door.

### Onboarding into an area nobody's written lore for yet

A different joiner picks up a ticket in `src/refunds/dispute_export/` — a
newer corner of `payments/` with no `.lore/` coverage at all:

```
> /lore:onboard PAY-206 dispute export
```

> `grounded in: 0 confirmed + 0 draft notes (0 disputed) + git history` — no
> lore captured for this area yet — everything below is live-derived from
> git.
>
> **Unconfirmed guesses from git history — not team-verified lore. Confirm
> with an owner before relying on these.**
> - `git show a1b2c3d`: reverted an eager-export change — export ran before
>   the dispute was finalized, producing wrong totals.
> - `git show e4f5a6b`: "hotfix: export retried too aggressively, vendor
>   started rate-limiting us."
>
> Worth keeping? `/lore:mine` will draft these properly, or `/lore:capture`
> once you've confirmed them with an owner.

Nothing gets written — the brief is entirely ephemeral. Decision history
below this section skips both commits since they're already shown above.

## 8. Overview mode: asking for the whole project

`/lore:onboard` normally scopes to a ticket or area (§7). An **explicit**
whole-project ask switches it to a different, pinned skeleton instead:

```
> /lore:onboard give me an overview of the whole project
```

> `grounded in: 1 confirmed + 2 draft notes (0 disputed) + git history`
>
> **Orientation.** `payments/` runs a billing pipeline that moved off an
> internal `LegacyBilling` reconciler onto the current `Ledger` service —
> commit `9c3d1a2` migrated `reconcile()` (see `src/billing/ledger.py`). No
> migration evidence found in this repo for the refunds pipeline — that
> area isn't asserted as legacy, just unevidenced either way.
>
> **Docs map.**
> - `docs/ARCHITECTURE.md` — service boundaries, billing/refunds split.
> - `docs/adr/0004-ledger-migration.md` — why reconciliation moved off
>   `LegacyBilling`.
>
> DOC DRIFT — `docs/ARCHITECTURE.md` references `LegacyBilling.reconcile()`,
> not found in current tree (grep of `src/billing/` finds no `LegacyBilling`
> symbol); verify with an owner.
>
> **Tripwires + notes.** The confirmed `*2` tripwire in `src/pay.py` (§2),
> plus the two batch-drafted notes on `RefundQueue` and refund retries (§3).
>
> **Decision history / who to ask.** `9c3d1a2` and `65fad85` are the
> notable commits; recent blame authors of `src/billing/` and `src/pay.py`
> are jane and newjoiner.

A scoped ask like `/lore:onboard PAY-206 dispute export` (§7) never produces
this skeleton — only the explicit overview ask does. Note what's absent: no
status table, no percentages, no per-component "done/not done" verdict.
Migrations are cited event-by-event; an area with no history evidence is
named as "no evidence found," never asserted as legacy.

## 9. Locked-down environments: degrade, don't grind

Same overview ask, but in a hardened session where every `git` call is
denied by policy. Claude doesn't hammer the permission wall or coach you to
widen it — one line names the gap, and the coverage header stops claiming
git grounding:

> git calls are blocked in this session — decision history and blame-based
> "who to ask" are omitted; this brief is derived from the tree and
> `.lore/` notes only.
>
> `grounded in: 1 confirmed + 2 draft notes (0 disputed) + tree+notes only
> (git unavailable)`

Everything notes and the tree can support still arrives (tripwires, note
bodies, the docs map); everything that needed git is named as missing
rather than silently thinned. lore never suggests which allowlist entry
would unblock it — that's your admin's call, not a knowledge tool's. See
"Locked-down environments" in the README for the blocker classes no
allowlist entry can fix.
