---
description: Seed draft lore notes from git history, PR reviews, ADRs, and CODEOWNERS
---

Use the `using-lore` skill for the note format, redaction checklist, and the
no-compliance-narration, provenance, and permission-degrade rules. Mine this
repo for candidate lore. Everything mined stays `status: draft`; cap the run
at **5** drafts total — pick the strongest signals across all sources.

The deterministic signal floor — reverts plus incident/fix/workaround/
hotfix-keyed commits on still-existing files (source 1), and ADR presence
(source 3) — is applied **exhaustively and reported** (what was found, or an
explicit "none"), never sampled. This found-or-none reporting rule covers
the floor only: a conditional source whose precondition is absent (source 2
without `gh`, source 4 without a CODEOWNERS file, source 5 without a ticket
tool) gets **no line in your output at all** — no "skipped" entry, no
mention, and no meta-note that you are omitting it or applying this rule. For
this run, an absent-precondition source does not exist; your output simply
moves on.

**Under blocked git (D6).** If `git` comes back blocked or denied, degrade
the way `/lore:ask` does (the skill's permission-degrade rule): say so in
**one line**, let the floor report enter its unavailable state (output part 1
below), and continue with the tree-readable sources only (ADRs via
Read/Glob, CODEOWNERS if present). **Never ask the user how to proceed, and
never invoke tools unrelated to mining.**

Sources, in order:

1. **Git history.** Read `git log` for reverts and for commits keyed on
   incident/fix/workaround/hotfix language, restricted to files that still
   exist in the tree. Match these keywords treating **any non-letter
   character as a word boundary** (whitespace, punctuation, `_`, `-`, `/`,
   digits): `hotfix_cicd` and `hotfix/login` ARE hotfix hits (a developer
   named the thing hotfix), while letter-adjacent substrings ("pre**fix**",
   "**fix**ture", "**fix**ed-wording") are NOT fix commits and do not count.
   Draft as `kind: tripwire` or `why` with `source:` the commit sha(s) and
   `anchors:` the still-existing files. **Skip a candidate whose why is
   already stated by an inline comment at the anchored lines** — lore targets
   the undocumented why, and a comment at the anchor is already where a
   reader looks; apply this **only** when the comment states the SAME fact
   the draft would, and **when in doubt, draft** (drafts are react-only and
   cheap; a silent skip of an undocumented fact is not). Report the skip as a
   **drop note with the commit citation** in the floor report (output part 1)
   — a finding, not compliance narration.

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

   **Fold, don't duplicate (D5):** when a mappable ticket's anchor lands on
   the **same landed artifact** (commit sha / merged PR) or the **same
   still-existing path** as an existing source-1 candidate, do not draft a
   separate note — record the ticket as a **bare co-reference** on that
   candidate's source line: `source: commit <sha> (also referenced by
   <TICKET-ID>)`. The phrasing asserts only that the ticket references the
   artifact, never that it corroborates or restates what the note says.
   Distinct facts on the same file stay separate notes; a folded candidate
   consumes one cap slot; a ticket mapping to no existing candidate's
   artifact/path follows the normal source-5 rules above (own draft if
   anchorable, drop if not). Cap-priority (git first) is unchanged — no
   competing-case logic.

**Selecting within the 5-draft cap.** Order the candidates the floor already
produced: production incidents and outages first, then reverts and ADR-backed
decisions WITH stated rationale, then workarounds. When a rationale-bearing
why/ADR candidate exists, **reserve it at least one slot** — the seed set must
not be all tripwires on incident-dense repos. A rationale-free revert is
drafted only if slots remain, and its body must state that the message gives
no rationale and an owner should fill it in.

Then **redact**: run the skill's redaction checklist over every draft. PR and
ADR text is human-written — be especially alert for named-person negativity
and internal hostnames. Ticket text additionally requires the checklist's
ticket/tracker clause — strip assignee/reporter/commenter names,
status-change politics, and team-vs-team escalation narrative. Report what
redaction did per the skill's D4 rule (categories and counts only, or the
source pointer only on abort) as the redaction-report slot below — never the
stripped strings.

## Output — exactly these five parts, in order

Your entire output is these five top-level parts and nothing else — no
preamble, no compliance narration, no naming of absent sources. A part with
nothing to render is **omitted entirely** — never render an empty
placeholder ("none", "—", "n/a") for it, and never explain why a part is
empty (that explanation is itself absent-source narration). Only the floor
report (part 1) has a mandatory empty state (its explicit "none").

1. **Floor report.** Always renders, in exactly one of three states: the
   exhaustive source-1 findings plus ADR presence (source 3); an explicit
   **"none"**; or — under blocked git (D6 above) — the line "git history
   unavailable — the deterministic floor cannot run", with ADR presence
   still reported when the ADR directory is tree-readable (source 3 needs no
   git). D7b code-comment drop notes for source-1 candidates render here,
   each with its commit citation.
2. **Conditional-source findings.** For each conditional source (2 PR
   threads, 4 CODEOWNERS, 5 tickets) whose precondition **held** this
   session: its candidates **and** its drop notes. A present-tool source
   renders its drop notes even when it drafted **zero** candidates — with the
   tool present, a drop (e.g. no mappable anchor) is a citable finding, not
   compliance narration. A source whose precondition did **not** hold has no
   slot: it is never named, counted, or alluded to. A present source with
   neither candidates nor drops renders nothing.
3. **Drafts.** The ≤5 drafts, each shown as the **exact file content** that
   would be written — frontmatter then body — in **one fenced block**. Every
   draft writes `verified_sha: <HEAD at drafting>` and
   `verified_date: <today>` (the drafting baseline per the skill's split
   field semantics; `status: draft`).
4. **Redaction report.** The fixed one-line slot, rendered **iff** external
   human-authored text (commit-message quotes, PR/ticket/ADR quotes) was
processed this run:
   `redaction pass: stripped <category: count, …>` or `redaction pass:
   nothing to strip`. Its presence proves the pass ran; wording per the
   skill's D4 rule.
5. **Closing.** Over-cap leftovers (one sha-cited line each), then the
   present-for-review ask: do not confirm or write files without the user's
   go-ahead; they promote drafts later via `/lore:verify` or PR review.

Nothing outside these five parts appears in your output.
