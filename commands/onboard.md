---
description: Assemble a work-scoped onboarding brief for a ticket or area
argument-hint: [ticket, file path, or area]
---

Use the `using-lore` skill for trust rules and staleness labeling. Assemble a
**brief scoped to the named work — not a wiki tour**. `$ARGUMENTS` names the
ticket, file path, or area; if absent, ask what they'll be working on before
doing anything else.

The brief **opens with a coverage header — byte one, in both modes; nothing
renders before it** (no scene-setting, no degrade preamble, no first-person
methodology remark — "Git history calls are being blocked… I have enough
from the tree to compose a scoped brief" is the banned shape):
`grounded in: N confirmed + M draft notes (J disputed)` followed by the
provenance term — N/M count, by
`status:`, the notes the brief's body **cites by filename** (a note read
while gathering but not cited earns no count; step-4 mining candidates
carry no `status:` and never feed these counts), J is the disputed overlay
of those cited notes; all three derive from the composed brief's own
citation set, not recalled — compose the brief first, then derive the counts
and emit the header above it (the skill's coverage-header rule). The provenance
term and the zero-note empty-state phrase are **attempt-based** per the
skill's coverage-header rule and flip together: git executed → `+ git
history`; git attempted-and-denied → the degrade substitution; git never
attempted → `+ tree+notes (git history not needed for this answer)`. When
doc-drift spot-checks ran on docs the brief cites, the header also gains
`+ N docs spot-checked` — but **only** when the risk-flags slot carries the
per-doc receipt lines that earn it (the doc-drift instruction below; the
skill's earned-claim rule): no receipt lines ⇒ no term. If no note anywhere
in `.lore/` anchors into the
scoped paths, say so plainly instead of bottoming out silently, with the
attempt-matched empty-state phrase — git executed: "no lore captured for
this area yet — everything below is live-derived from git"; git never
needed: "no lore captured for this area yet — everything below is derived
from the tree and notes; git history wasn't needed here." The empty-state
phrase renders in its **fixed wording** — no inserted parentheticals, no
appended methodology ("(repeated `git` calls required approval that wasn't
granted)" is the banned shape). Under a permission wall, the degrade renders
**once**: the header's substitution term plus the skill's one fixed gap line
— never re-narrated per slot ("couldn't be pulled since `git log` was
blocked" repeated through the body is the banned shape). Any disputed note
surfaced anywhere in the brief carries the footnote:
`⚠ unresolved dispute (<blame-author>, <blame-date> — not owner-verified):
<reason>`, with author/date read live via `git blame`/`git log -1` on that
note's `disputed:` line. Whenever the brief cites or quotes a human doc as
the source for a claim about code, spot-check that claim against the current
tree first (the skill's doc-drift rule); on a grep-verifiable divergence emit
`DOC DRIFT — <doc path> references <thing>, not found in current tree
(<citation>); verify with an owner.` Each spot-check composes one entry on the
**spot-check list** — the doc, the concrete grain(s) checked, and the verdict
— built with the brief, not recalled after; the **risk-flags slot** renders
exactly **one** receipt line per list entry (one per doc — multiple grains on
one doc fold into that doc's single line) — that DOC DRIFT line on a
divergence, otherwise the aligned receipt
`<doc path> — checked <claim → tree target> — aligned` (the skill's
one-receipt-per-doc rule). The `+ N docs spot-checked` term's N **is the
spot-check list's length** (derived, not recalled): N receipt lines in the
risk-flags slot ⇔ the term, zero entries ⇒ neither. Only for docs the brief
actually relies on, never a repo-wide doc audit.

**Render skeleton (scoped mode).** A rendering pin of steps 1–7 — no step's
semantics change, no step is dropped, tripwires stay first. Step 1 routes (to
this scoped path or to Overview mode) and is **not a slot**. In scoped mode,
render exactly these slots in order; a slot with nothing to render is
**omitted entirely** — there is no preamble slot, and no completeness language
anywhere:
- **Coverage header** — the header above.
- **Tripwires + risk flags** — step 2 (tripwires FIRST and prominent), then
  staleness labels, DOC DRIFT lines, and the per-doc receipt lines.
- **Brief body** — steps 3 and 5 (relevant notes + live decision history),
  citations inline.
- **Who to ask** — step 6, in the two-state shape below.
- **Gaps** — step 4's mining-first candidates, under the unconfirmed-guesses
  frame. Present **iff step 4 fired**; never rendered to say coverage was
  sufficient ("Gaps: none" is banned prose).
Step 7's closing offers render after the skeleton. The step-4/step-5 de-dup
(decision history does not re-list mining candidates) still holds across the
brief-body and gaps slots.

1. **Resolve the scope — and pick the mode.** If `$ARGUMENTS` (or, when you
   asked what they'll work on, their answer) is an **explicit
   whole-project/overview ask** — it contains "overview", "the whole
   project/repo", "how the system fits together", or an unambiguous
   whole-repo synonym; never inferred from breadth alone — enter
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
   and report what you found** (or an explicit "none" — a mandated attestation
   on the skill's exempt list, not suppressible empty-state prose) — never a
   sampled subset. Present the results under exactly this frame:
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

6. **Who to ask — two-state; never name a source you did not consult.**
   - *Git-author path:* author line(s) only — name, recency, paths touched —
     from `git log --format='%an <%ae>' -- <path>` on the recent history.
     The words "CODEOWNERS" and "fallback" **must not appear** in this state
     ("no fallback was needed" is banned prose); the state renders author
     lines and nothing else.
   - *Fallback path:* only when the last author hasn't committed in >6 months
     or is absent from the recent log, consult CODEOWNERS **because** the
     author signal was stale/absent, stating that trigger; then report what
     the consultation found — the owning entry for those paths, or that
     CODEOWNERS holds no ownership record for them (that finding is the
     receipt). There is no third state that names an unconsulted source.
     If git itself is blocked or denied, neither state fires — who-to-ask
     degrades per the skill's permission-walls rule; git-unavailability is
     **never** read as a stale/absent author signal. When neither state
     fires, the slot is **silent** — never a sentence explaining why there
     is no who-to-ask ("No who-to-ask section: with git blocked…" is the
     banned shape; the header's degrade term already carries that fact).

7. **Close.** Keep the whole brief short; cite every claim (path:line, sha,
   or note filename) per the skill. End with **one closing line** offering
   `/lore:ask` (and `/lore:capture` when the area has no notes) — a pointer,
   not a recap: no rerun offers ("if you can get git approved, I can rerun
   this" is the banned shape), no narration of slots that stayed silent, and
   nothing after it.

## Overview mode

Entered only via the explicit overview ask in step 1. **Writes no files.** The
coverage-header line is **byte one of the brief** — nothing renders before it:
no scene-setting sentence about the repo or its `.lore/` state ("`.lore/`
doesn't exist in this repo — here's what's derivable" is the banned shape;
the header's own empty-state phrase already carries that fact). The
six section headings below are **literal template strings, rendered verbatim
and in this pinned order** — no synonyms, no reordering (tripwires stay heading
4, never hoisted above Orientation), no invented top-level sections, and no
splitting or merging a literal (heading 5 is the ONE heading `Decision history
+ who to ask`, never two). A section
renders its exact heading literal then its body **iff** its findings list is
non-empty; an empty section omits heading AND body entirely (no empty heading,
no "this section is empty" line). Item 1 is the exception: the coverage
header is a **line, not a titled section** — it renders no heading and, as a
mandated attestation, it ALWAYS renders (its zero-note empty state included),
never gated on findings. Enrichment may vary freely within a rendered
section:

1. **Coverage header** (the header above), counts scoped to the whole repo.
2. **Orientation — what the repo is**. Where a legacy-vs-current split of
   any kind is visible — a migration, rewrite, or replacement of services,
   frameworks, data stores, pipelines, or anything else — report **cited
   migration events only** —
   "commit/PR X migrated Y (citation)" — and **never** assert per-component
   completeness, percentages, or a migrated/not-migrated status verdict
   ("payments is still fully on the legacy side" is the banned verdict shape;
   the sanctioned form below carries the same information honestly).
   State absence of evidence as "no migration evidence found in this repo for
   Z", never as "Z is legacy" — and only for a **specific Z whose
   legacy-vs-current split is actually visible in the repo**, never as a
   roster of things not found. **Completion rule:** when a cited migration
   event is reported for one component of a visible split, every OTHER
   component of that same visible split renders either its own cited event
   or its Z-absence line — reporting the moved component while silently
   skipping the unmoved one is the missing-half failure. Never a blanket
   "no migration evidence in this repo" with no Z. Never narrate the
   omission itself ("omitted
   rather than guessed at" is banned prose — an empty section is silent). Give trade-offs only when a human wrote them
   somewhere citable (quote + cite).
3. **Docs map**. Entry-point human docs, each **named + cited** with a
   one-line description — names and cites, does not reproduce or explain their
   content. The map itself triggers **no** per-doc code checking; the
   doc-drift flag (intro) applies only to docs whose claims the brief actually
   relies on and cites.
4. **Tripwires + relevant notes** — steps 2–3 above, whole-repo.
5. **Decision history + who to ask** — steps 5–6 above, whole-repo.
6. **Getting hands-on (optional) — entry points (cited; unverified as a
   sequence)**. Renders **only** when the tree holds at least one
   manifest/CI/Make-class file, a tests directory, or a docs index — plain
   source files never qualify as entry points and never earn this part. At
   most 5 lines, each a **noun-phrase pointer** (no leading verb) to such an
   artifact verified present in the tree, each with its citation. A command
   string may appear only **quoted verbatim from one of those files** —
   never composed by you ("`python main.py`" invented from a source file is
   the banned case). A line is the artifact name + citation +
   at most a neutral ≤6-word descriptor of what the artifact **is**; no
   evaluative, sequencing, or priority words **anywhere in the line** (no
   "start here", "worth running first"). No invented commands, no "safe first
   change", no completeness or difficulty judgments: these are places to
   open, not steps to follow. No qualifying artifacts ⇒ this part is omitted
   and its absence is not narrated — never name the artifact classes that
   are missing ("no test suite, CI config, or manifest exists" is banned
   prose).

After the last rendered section, **one closing line** offering `/lore:ask`
(and `/lore:mine` when `.lore/` is empty) may render — a pointer, not a
recap; nothing else renders after it.

**Workflow labels are verbatim and cited.** Where the overview organizes the
repo by its workflows or pipelines, group around the repo's OWN evidenced
workflows — every workflow label must be a **verbatim artifact name from the
tree** (a CI job name, a Make/npm-script target, a pipeline/model directory
name), with the naming artifact cited. Synthesized or renamed groupings are
banned: group only what the repo itself already names.

When `.lore/` is empty or has fewer than 3 notes repo-wide, the mining
fallback (step 4 above, exhaustive-and-reported) still applies but is
**bounded**: a recent-history window (default the last ~200 commits or ~12
months, whichever
is larger) and at most 5 strongest candidates, no padding. State the window
you used in the brief. The fallback's candidates, its window statement, and
its found-or-none report all render **inside heading 4 (`Tripwires +
relevant notes`) under the unconfirmed-guesses frame** — never as an
invented top-level section (a `Gaps` or `Mining` heading is the banned
shape) and never duplicated into Decision history.
