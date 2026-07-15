---
description: Assemble a work-scoped onboarding brief for a ticket or area
argument-hint: [ticket, file path, or area]
---

Use the `using-lore` skill for trust rules and staleness labeling. Assemble a
**brief scoped to the named work — not a wiki tour**. `$ARGUMENTS` names the
ticket, file path, or area; if absent, ask what they'll be working on before
doing anything else.

The brief **opens with a coverage header**, computed from what steps 2–4
actually gathered: `grounded in: N confirmed + M draft notes (J disputed) +
git history` — N/M count by `status:`, J is an overlay count of notes (either
status) carrying a `disputed:` line. If no note anywhere in `.lore/` anchors
into the scoped paths, say so plainly instead of bottoming out silently:
"no lore captured for this area yet — everything below is live-derived from
git." Any disputed note surfaced anywhere in the brief carries the footnote:
`⚠ unresolved dispute (<blame-author>, <blame-date> — not owner-verified):
<reason>`, with author/date read live via `git blame`/`git log -1` on that
note's `disputed:` line. Whenever the brief cites or quotes a human doc as
the source for a claim about code, spot-check that claim against the current
tree first (the skill's doc-drift rule); on a grep-verifiable divergence emit
`DOC DRIFT — <doc path> references <thing>, not found in current tree
(<citation>); verify with an owner.` — only for docs the brief actually
relies on, never a repo-wide doc audit.

1. **Resolve the scope — and pick the mode.** If `$ARGUMENTS` (or, when you
   asked what they'll work on, their answer) is an **explicit
   whole-project/overview ask** — it contains "overview", "the whole
   project/repo", "how the system fits together", or equivalent — enter
   **Overview mode** (below): skip path-scoping and follow the overview
   skeleton. A merely broad area name (a big subsystem) is **not** an overview
   ask — it stays on this scoped path, which never emits the overview
   skeleton. Otherwise map the ticket/area to concrete repo paths (grep for
   keywords, follow imports); everything below is restricted to those paths —
   omit anything not relevant to this work.

2. **Tripwires first, prominently.** Surface every confirmed `.lore/`
   tripwire whose anchors cover the scoped paths, at the top of the brief,
   staleness-labeled per the skill.

3. **Relevant notes.** Other `.lore/` notes (why/runbook/coupling/glossary)
   anchored to or mentioning the scoped paths, each labeled with status
   (`(draft, unconfirmed)`) and staleness per the skill.

4. **Mining fallback — only if nothing above covers this area.** If **no**
   `.lore/` note's anchors overlap the scoped paths (steps 2–3 came up
   empty), mine for candidates inline instead of leaving the brief blank.
   Apply the same signals `/lore:mine` sources 1 and 3 use — reverts and
   incident/fix/workaround/hotfix-keyed commits from `git log`, plus ADRs if
   a `docs/adr/`, `docs/decisions/`, or `adr/` directory exists — restricted
   to the scoped paths only. Apply these signals **exhaustively within scope
   and report what you found** (or an explicit "none") — never a sampled
   subset. Present the results under exactly this frame:
   "Unconfirmed guesses from git history — not team-verified lore. Confirm
   with an owner before relying on these." Each candidate cites a sha the
   reader can `git show`. **Write no files.** Close the section by offering
   `/lore:mine` or `/lore:capture` to persist anything worth keeping. When
   this step fires, step 5 (decision history) must not re-list the commits
   already shown here as candidates — it covers the remaining notable
   history only.

5. **Decision history, live.** `git log --oneline -- <paths>` for the scoped
   paths: summarize the notable decisions — reverts, incident fixes, PR
   references in commit messages — with shas cited. Keep it to what a person
   starting this ticket needs. If step 4 fired, skip any commit already
   listed there.

6. **Who to ask.** Recent blame authors of the scoped paths
   (`git log --format='%an <%ae>' -- <path>` on the recent history). If the
   last author hasn't committed in >6 months or is absent from the repo's
   recent log, fall back to CODEOWNERS for those paths.

7. **Close.** Keep the whole brief short; cite every claim (path:line, sha,
   or note filename) per the skill. End by offering `/lore:ask` for
   follow-up questions.

## Overview mode

Entered only via the explicit overview ask in step 1. **Writes no files.** The
brief follows this **pinned section order** — enrichment may vary freely
within a section, but do not invent new top-level sections:

1. **Coverage header** (the header above), counts scoped to the whole repo.
2. **Orientation — what the repo is.** Where a legacy-vs-current pipeline
   migration split is visible, report **cited migration events only** —
   "commit/PR X migrated Y (citation)" — and **never** assert per-component
   completeness, percentages, or a migrated/not-migrated status verdict.
   State absence of evidence as "no migration evidence found in this repo for
   Z", never as "Z is legacy". Give trade-offs only when a human wrote them
   somewhere citable (quote + cite).
3. **Docs map.** Entry-point human docs, each **named + cited** with a
   one-line description — names and cites, does not reproduce or explain their
   content. The map itself triggers **no** per-doc code checking; the
   doc-drift flag (intro) applies only to docs whose claims the brief actually
   relies on and cites.
4. **Tripwires + relevant notes** — steps 2–3 above, whole-repo.
5. **Decision history + who to ask** — steps 5–6 above, whole-repo.

When `.lore/` is sparse or empty for the whole repo, the mining fallback (step
4 above, exhaustive-and-reported) still applies but is **bounded**: a
recent-history window (default the last ~200 commits or ~12 months, whichever
is larger) and at most 5 strongest candidates, no padding. State the window
you used in the brief.
