---
description: Seed draft lore notes from git history, PR reviews, ADRs, and CODEOWNERS
---

Use the `using-lore` skill for the note format and redaction checklist. Mine
this repo for candidate lore. Everything mined stays `status: draft`; cap the
run at **5** drafts total — pick the strongest signals across all sources.

The deterministic signal floor — reverts plus incident/fix/workaround/
hotfix-keyed commits on still-existing files (source 1), and ADR presence
(source 3) — is applied **exhaustively and reported** (what was found, or an
explicit "none"), never sampled. This found-or-none reporting rule covers
the floor only: a conditional source whose precondition is absent (source 2
without `gh`, source 5 without a ticket tool) gets **no line in your output
at all** — no "skipped" entry, no mention, and no meta-note that you are
omitting it or applying this rule. For this run, an absent-precondition
source does not exist; your output simply moves on.

Sources, in order:

1. **Git history.** Read `git log` for reverts and for commits keyed on
   incident/fix/workaround/hotfix language, restricted to files that still
   exist in the tree. Draft as `kind: tripwire` or `why` with `source:` the
   commit sha(s) and `anchors:` the still-existing files.

2. **PR review threads** (only if `gh` is installed and this is a GitHub
   repo — check with `gh repo view` and skip this source silently otherwise).
   Search merged-PR review comments for pushback language ("don't do this
   again", "this broke", "never", "careful", "we tried this before"), e.g.
   via `gh pr list --state merged --limit 30` and `gh api` on their review
   comments. Draft the durable warnings as `tripwire`/`why` notes with
   `source: PR #N`.

3. **ADRs.** If a `docs/adr/`, `docs/decisions/`, or `adr/` directory exists,
   read the accepted decisions and draft the ones still relevant to existing
   code as `kind: why` notes, `source:` pointing at the ADR file.

4. **CODEOWNERS coupling.** If a CODEOWNERS file exists, note path groups
   that share an owner but live in distant directories — a hint that they
   change together. Draft at most one `kind: coupling` note for the clearest
   case, `source: CODEOWNERS`.

5. **Ticket tracker** (only if a ticket-tracker tool — Jira, Rally, or
   similar — is actually present in this session's available tools; if none
   is, skip this source **silently**: no "skipped" line, no ticket-tracker
   heading, tickets never mentioned in the output — see the floor-only
   reporting rule above). Per the skill's anti-confabulation bar, never
   narrate a ticket search unless the tool is verifiably present, and never
   emit a ticket ID that didn't come from a tool result. Query the tool for
   incident/decision language (incident, outage, rollback, decision,
   postmortem, workaround), scoped to the team/project it exposes. Keep a
   candidate only if the ticket maps to a **still-existing repo path** — an
   explicitly referenced path/component you can locate in the tree, or a
   linked merged PR/commit whose files still exist; **no mappable anchor ⇒
   drop it** (no anchor, no trust). Prefer tickets that reference a landed
   artifact (a merged PR/commit) over free-standing discussion, and phrase
   every draft observationally — a ticket records what was **said or
   proposed**, never the outcome unless the landed artifact shows it. Draft as
   `tripwire`/`why` with `source:` the ticket ID(s) the reader can open.
   Git-history hard-fact candidates (source 1) take priority within the
   5-draft cap; ticket-sourced candidates fill only the slots left over.

Then:

6. **Redact.** Run the skill's redaction checklist over every draft. PR and
   ADR text is human-written — be especially alert for named-person
   negativity and internal hostnames. Ticket text additionally requires the
   checklist's ticket/tracker clause — strip assignee/reporter/commenter
   names, status-change politics, and team-vs-team escalation narrative.

7. **Present.** Show the drafts for review — do not confirm them, do not
   write files without the user's go-ahead. The user promotes them later via
   `/lore:verify` or PR review.
