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
review threads (when `gh` is available), ADR directories, and CODEOWNERS,
then presents up to 5 **draft** notes for review — nothing is written
without your go-ahead, and nothing mined is ever auto-confirmed.

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

## 3. The tripwire fires — at the moment of danger

Weeks later, a new joiner (or their Claude) edits `src/pay.py`. The first
edit attempt is stopped **once**, with the warning as the reason:

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

## 4. Ask, and get cited answers

```
> /lore:ask why does charge() multiply by 2?
```

> - `src/pay.py:2` — `return amount * 2  # retry-safe`
> - Note `.lore/tripwire-pay-double-charge.md` (status: **confirmed**,
>   verified 2026-07-14 at `65fad85`): compensates a vendor rounding bug…
>
> Staleness: anchor unchanged since verification.

Unknown answers are never invented — Claude says "I don't know" and routes
you to the recent blame authors (or CODEOWNERS), then offers
`/lore:capture` once the human answers, so it's only worked out once.

## 5. Keep it trustworthy

```
> /lore:verify
```

Sweeps every note: anchors changed since `verified_sha` ⇒ walk through
**re-confirm / update / retire**; vetted drafts get promoted (trust rule
enforced — only blame authors/CODEOWNERS of the anchors can confirm).

## 6. People flows

- New joiner, first ticket: `/lore:onboard PAY-123 refund flow` → a brief
  scoped to that work — tripwires first, decision history, who to ask.
- Someone leaving: `/lore:offboard` → bus-factor scan finds the areas only
  they ever touched, then an in-context interview drafts the notes before
  the knowledge walks out the door.
