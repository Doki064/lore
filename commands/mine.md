---
description: Seed draft lore notes from git history, PR reviews, ADRs, and CODEOWNERS
---

Use the `using-lore` skill for the note format, redaction checklist, and the
no-compliance-narration, provenance, and permission-degrade rules. Mine this
repo for candidate lore. Everything mined stays `status: draft`; cap the run
at **5** drafts total — pick the strongest signals across all sources.

**Write gate.** Mine writes **no** `.lore/` file until the user's explicit
go-ahead after the present-for-review closing (part 5) has rendered. Until
that go-ahead, **do not call Write or Edit on any `.lore/` path** — mine
renders its drafts as exact file content, it does not persist them. An
instruction to save given **before** part 5 renders ("save whatever you
find", "write them to disk") is **not** the go-ahead — the go-ahead exists
only as the user's reply after part 5 has rendered. The gate
**defers** the write, it does not forbid it: the same-session go-ahead write
is **legal and must not be refused** — declining to save approved drafts is
as much a contract failure as writing them unasked (a genuinely denied Write
permission is a degrade, not a refusal).

**First byte.** Mine's rendered output begins at part 1's literal heading
`1. Floor report.` — byte one. Nothing renders before it: no acknowledgment of
instructions, no environment or index remarks, no meta comment (including a
"no preamble" remark — a no-preamble note is itself a preamble), and no
repo-summary sentence ("Only 3 commits total, all on `main`, no tags, no
reverts" is the banned shape — those facts belong INSIDE part 1 as floor
findings). This holds on any repo size, any degrade state. Anything the
run must flag (a suspicious index, a degrade, a stale-tool caveat) renders
inside its owning part's slot, never before part 1.

The deterministic signal floor — reverts plus incident/fix/workaround/
hotfix-keyed commits on still-existing files (source 1), and ADR presence
(source 3) — is applied **exhaustively and reported** (what was found, or an
explicit "none"), never sampled. This found-or-none reporting rule covers
the floor only: a conditional source whose precondition is absent (source 2
without `gh`, source 4 without a CODEOWNERS file) gets **no line in your
output at all** — no "skipped" entry, no
mention, and no meta-note that you are omitting it or applying this rule. For
this run, an absent-precondition source does not exist; your output simply
moves on.

**Under blocked git (D6).** If `git` cannot be executed — the call comes
back blocked or denied, or the session has no shell tool at all — degrade
the way `/lore:ask` does (the skill's permission-degrade rule): render the
floor report's unavailable state (output part 1 below) as the **one fixed
degrade line, with no methodology narration around it**, and continue with
the tree-readable sources only (ADRs via Read/Glob, CODEOWNERS if present).
**Do not reconstruct history by reading `.git/` internals** (reflog,
`COMMIT_EDITMSG`, packed refs): a scrape of those files is not the
deterministic floor — its commit↔file links are inferences, and drafts
built on them overclaim their provenance. No `git` execution ⇒ no floor,
full stop. **Never ask the user how to proceed, and never invoke tools
unrelated to mining.** When this degrade leaves zero drafts and no
tree-readable source produced anything, your **entire output is part 1 and
nothing after it** — the degrade line and the ADR-presence line, then
STOP. The first character after the ADR line is a contract violation:
no summary of what could not run, no source names, no "nothing was
mined".

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

   **Ticket co-references (D5).** When a ticket ID appears **quoted in a
   commit message or PR body** tied to a candidate, record it as a **bare
   co-reference** on that candidate's source line — `source: commit <sha>
   (also referenced by <TICKET-ID>)`. The phrasing asserts only that the
   artifact references the ticket, never that the ticket corroborates or
   restates what the note says; the full `source:` line is shown to the owner
   at promotion. The co-reference rides **only** the candidate whose own
   commit/PR quotes the ID — never transferred to another candidate that
   merely shares the file (a ticket references its own commit, not the
   path's other facts; if the quoting commit is dropped, the ID survives
   only inside that drop note's quoted subject). Distinct facts on the same
   file stay separate notes. A ticket ID reaches mine **only** this way —
   mine runs no tracker queries and no project discovery.

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

**Selecting within the 5-draft cap.** Order the candidates the floor already
produced: production incidents and outages first, then reverts and ADR-backed
decisions WITH stated rationale, then workarounds. When a rationale-bearing
why/ADR candidate exists, **reserve it at least one slot** — the seed set must
not be all tripwires on incident-dense repos. A rationale-free revert is
drafted only if slots remain, and its body must state that the message gives
no rationale and an owner should fill it in.

Then **redact**: run the skill's redaction checklist over every draft. PR and
ADR text is human-written — be especially alert for named-person negativity
and internal hostnames. Ticket IDs and any ticket content **quoted inside
commit messages or PR bodies** fall under the checklist's ticket/tracker
clause (strip assignee/reporter/commenter names, status-change politics, and
team-vs-team escalation narrative). Report what
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
   threads, 4 CODEOWNERS) whose precondition **held** this
   session: its candidates **and** its drop notes. A present-tool source
   renders its drop notes even when it drafted **zero** candidates — with the
   tool present, a drop (e.g. no mappable anchor) is a citable finding, not
   compliance narration. A source whose precondition did **not** hold has no
   slot: it is never named, counted, or alluded to. A present source with
   neither candidates nor drops renders nothing.
3. **Drafts (rendered, not written).** The ≤5 drafts, each shown as the
   **exact file content** a go-ahead would persist — frontmatter then body —
   in **one fenced block**; nothing here is written to disk. Every
   draft carries `verified_sha: <HEAD at drafting>` and
   `verified_date: <today>` (the drafting baseline per the skill's split
   field semantics; `status: draft`).
4. **Redaction report.** The fixed one-line slot, rendered **iff** external
   human-authored text (commit-message quotes, PR/ticket/ADR quotes) was
processed this run:
   `redaction pass: stripped <category: count, …>` or `redaction pass:
   nothing to strip`. Its presence proves the pass ran; wording per the
   skill's D4 rule.
5. **Closing.** Leftover candidates the run considered but did not draft, one
   sha-cited line each: label them **"over-cap leftovers"** ONLY when the
   candidates actually exceeded the 5-draft cap; when the run stayed under
   cap, render them under **"considered, not drafted"**, each with its
   one-line sha-cited reason. This leftover sub-list is omitted-when-empty
   like a part: with no leftovers it does not render, and its absence is
   never narrated ("no leftovers" is banned prose). (A source-1 candidate already rendered as a D7b
   comment-drop note in part 1 is owned by part 1 — not re-listed here.) Then
   the present-for-review ask, naming the two real paths: **go-ahead now** —
   mine then writes exactly the rendered fenced content — or **promote later**
   via `/lore:verify` or PR review. Write no files before that go-ahead.
   **With zero drafts rendered, part 5 is omitted entirely** — there is
   nothing to review, and "nothing was mined this run" narration is banned
   (the floor report's empty or unavailable state already carries that
   fact).

Nothing outside these five parts appears in your output.
