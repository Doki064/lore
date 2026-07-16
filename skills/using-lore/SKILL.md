---
name: using-lore
description: This skill should be used when reading or writing `.lore/` knowledge notes, answering questions from team lore, or capturing tribal knowledge.
version: 0.6.0
---

# Using lore

`.lore/` is a directory of markdown knowledge notes in the target repo. One
note = one fact. Notes are versioned, greppable, and PR-reviewed like code.
This skill is the shared contract every `/lore:*` command obeys. Read it
whenever you read or write a note.

## Note format

One note = one file: `.lore/<kind>-<slug>.md`, slug kebab-cased from a few
identifying words of the note's first body line (keep filenames short),
e.g. `.lore/tripwire-reconciler-migration.md`. On filename collision,
append `-2`, `-3`.

```markdown
---
kind: tripwire
anchors:
  - src/billing/reconciler.py
  - migrations/
source: PR #482
verified_sha: 3fa9c21
verified_date: 2026-07-14
status: confirmed
confirmed_by: jane
---
Don't run the reconciler migration on prod without draining the queue
first — replays double-charge (incident 2025-11-03).
```

A note file is the frontmatter block then the body — nothing else. When a
command presents an **unwritten draft** for review, show it as the exact
file content (frontmatter then body) in **one fenced block**, so what the
reader approves is byte-for-byte what gets written.

### Field semantics (this is the contract)

- `kind`: open string. v1 uses `tripwire | why | runbook | glossary |
  coupling`. Only `tripwire` has special behavior (the edit-time hook).
- `anchors`: YAML list, one entry per line exactly as shown — never the
  inline `[a, b]` form (the hook parses these line-by-line). Each entry is a
  **repo-relative literal file path**, or a **directory prefix ending in
  `/`**. No globs. **No anchor, no trust** — a note without anchors cannot
  be relied on.
- `source`: where the fact came from — a PR, commit sha, incident, or
  person. Free text.
- `verified_sha` + `verified_date`: on a `status: confirmed` note, the
  commit and date of the last **human confirmation**. On a `status: draft`
  note, the **drafting baseline** — the commit the fact was checked against
  when drafted; no human has confirmed anything. `status:` is the only
  confirmation signal; every rendering of staleness derived from these
  fields must appear alongside the note's status label. A note whose
  `verified_sha` is absent or unresolvable is treated as unverified/stale on
  read — never fresh. A note is **stale**
  when any *file* anchor changed since `verified_sha`:
  `git diff --name-only <verified_sha>..HEAD -- <anchor>` is non-empty.
  Directory anchors never trigger staleness (churn is not falsity); they are
  informational only.
- `status`: `draft` (Claude-drafted or unvetted) | `confirmed`. Only
  `confirmed` tripwires fire the edit-time warning.
- `confirmed_by`: required when `status: confirmed`. The git user *name* of
  the confirmer — display only. Identity checks match on **email**
  (`git config user.email` vs blame `%ae`), because names drift.
- `disputed` (optional): one line of free text — a reader's reason to doubt
  the note, citing evidence (sha/PR/path) when they have it. **No
  `disputed_by`/`disputed_date` fields.** Author and age are read **live**
  from `git blame`/`git log -1` on the note's `disputed:` line — not
  anonymous, just not stored. **Anyone may add it** — disputing requires no
  confirm rights; doubt is not authorship. **Only owners clear it**, by
  resolving through `/lore:verify` (re-confirm or update both clear the
  field; retire deletes the file) or PR review. `status:` is unchanged by a
  dispute.

There is **no index file**. Notes are found by grepping `.lore/`. Ownership
is derived live from blame/CODEOWNERS, never stored.

## Reading a dispute

When a note carries a `disputed:` line, the note text still comes first,
unmodified — the dispute is a **subordinate footnote in fixed wording you
do not control**, never a prefix (a prefix would let the disputer's free
text reframe a safety warning), and it **never suppresses a tripwire**.

- In commands (`/lore:ask`, `/lore:onboard`, `/lore:verify`), read
  author/date live via `git blame`/`git log -1` on the `disputed:` line and
  render:
  `⚠ unresolved dispute (<blame-author>, <blame-date> — not owner-verified): <reason>`
- In the tripwire hook, the footnote is appended to the warning **without**
  author/date (the hook makes no extra git calls per note beyond
  staleness): ` (Unresolved reader dispute on file — not owner-verified:
  "<reason>". An owner resolves it via /lore:verify.)`. Construction order
  is: `TRIPWIRE for <rel> (...): <body>` → dispute footnote if disputed →
  `STALE — verify before trusting: ` prefix if stale (stays outermost).

## Coverage header (`/lore:ask` + `/lore:onboard`)

Every answer and every brief opens with one line:
`grounded in: N confirmed + M draft notes (J disputed) <provenance term>`
(the term per the attempt-based rule below — never a hardcoded
`+ git history`). N/M
count by `status:`; J is an **overlay count** of notes (of either status)
carrying a `disputed:` line — never a third status bucket. Counts are
**citation-derived**: N/M count the notes the answer or brief actually
**cites in its body by filename** — a note read while gathering but not cited
earns no count, so the header can never claim a note the body does not use;
J is the disputed overlay of those cited notes. Empty is stated, never
silently omitted.

**The provenance term and the zero-note empty-state phrase are
attempt-based** — they flip **together**, and neither ever claims grounding
in a source the answer did not draw on (the never-attempted variant may name
git precisely to disclaim it):
- **git executed** for this answer → `+ git history`; zero-note phrase "no
  lore captured for this area yet — everything below is live-derived from
  git."
- **git attempted and denied** → the degrade substitution
  (`+ tree+notes only (git unavailable)` / "git history unavailable …
  notes+tree-derived only") — see "Degrading under permission walls" below.
- **git never attempted** (not needed for this answer) → `+ tree+notes (git
  history not needed for this answer)`; zero-note phrase "no lore captured
  for this area yet — everything below is derived from the tree and notes;
  git history wasn't needed here."

The never-attempted case never renders a `+ git history` term anywhere in
the same answer. git history stays the **DEFAULT source** for
why/decision/history questions — the honest label is not a license to skip
history where history is the evidence.

When doc-drift spot-checks ran on docs the answer cites, the header also
gains `+ N docs spot-checked` (rendered only when spot-checks actually ran
on cited docs) — so a checked citation is observably different from an
unchecked one.

## Provenance bar (auto-drafted or ephemerally-presented content)

Applies to `/lore:mine`, `/lore:capture` batch mode, and `/lore:onboard`'s
mining-first candidates:
- Every candidate must cite a source you can open: commit sha, PR number,
  ADR path, or file path. No unsourced claim survives to a draft or a brief.
- Phrase observationally, never as asserted intent: "commit `abc123`
  reverted X, message cites double-charge" — never "the team decided X is
  dangerous" unless a human wrote exactly that (then quote it).
- These stay `status: draft` forever until an email-matched owner promotes
  them; never fabricate `confirmed_by`.

## Anti-confabulation bar (tool- and text-sourced citations)

Extends the cite-or-admit-ignorance rule (below) to session tools and to IDs
lifted from repo text. Applies wherever a claim would rest on an external
tracker or code-hosting tool (GitHub/GitLab, a ticket tracker, etc.) or on an
identifier taken from a commit message or PR body:
- **Never narrate a search on a tool that is not verifiably present** in the
  session's available tools.
- **Never emit an ID** that did not come from a tool result, from repo text
  (a commit message or PR body), or from **text the user provided
  in-session** (a pasted ticket, a pasted PR link) — this covers PR numbers,
  shas, and ticket IDs alike. (`/lore:mine` does not query a tracker; a
  ticket ID reaches mine only quoted inside git/PR text, recorded there as a
  bare co-reference. User-pasted IDs can reach `/lore:capture` and remain
  citable — the redaction checklist's ticket clause still applies to the
  surrounding text.)

## No compliance narration

Never report performing a check that found nothing reportable — no "no drift
found", no naming of absent tools or sources, no meta-notes about rules being
followed. **Findings are output; compliance is not.** And in the same breath:
**every specified check still MUST run — this rule suppresses narration of
clean results, never the check itself.**

**Earned-claim principle.** A claim of work renders only with its receipts:
an unused source or an unfired fallback has **no slot**. A bare assurance
("spot-checked", "consulted the owners file") is compliance narration; the
same work stated as a **reader-falsifiable receipt** — naming what was
checked, so a reader can open it and disagree — is a finding. Render the
receipt, never the bare assurance.

The coverage/provenance header (including its git-attempt and
`+ N docs spot-checked` terms) is always-shown provenance, not a "check"
this rule governs. Beyond it, three lines are explicitly **not** compliance
narration and are never suppressed by this rule:
- the **permission-degrade line** — a capability gap that changes what the
  reader gets (see "Degrading under permission walls");
- the **redaction report line** — proof-of-execution for the
  privacy-critical pass, shown under its own render condition (external
  human-authored text processed — see "Redaction checklist");
- **receipt lines** — findings-with-citations, the same class as
  `/lore:mine`'s drop notes ("a finding, not compliance narration"): e.g. a
  doc-drift receipt naming the doc and the claim/symbol grain actually
  checked (`docs/X.md — checked <claim → tree target> — aligned`, or a DOC
  DRIFT line). A receipt is reader-falsifiable, which is what earns it a slot
  where a bare "spot-checked" assurance does not; the `+ N docs spot-checked`
  header term renders **only** when these receipt lines are present. Receipt
  lines exist **only for doc spot-checks** — no other check class (a git
  lookup, a grep, tool presence) earns one; a clean non-doc check renders
  nothing.

## List-first rendering

Every slot in a pinned skeleton — an onboard section, an ask flags line, a
verify sweep part, a mine part — renders **only by iterating a non-empty
findings list**. Zero items ⇒ **no heading, no line, no sentence**: an empty
slot is silent, never a placeholder and never a sentence about its own
emptiness. Prose may not state a count or an absence that the findings list
itself does not carry. Sentence-form empty states are the banned class — "none
found", "no disputed notes this sweep", "all N verified — none stale", "no
fallback was needed", "Gaps: none", "omitted rather than guessed at" are
illustrations of the shape, not the rule; the rule is the structure, so a
reworded paraphrase is banned for the same reason. Findings-with-citations —
mine drop notes, doc-drift receipt lines — **are** list members and render by
this rule itself; they are not empty-state.

**Mandated attestations are exempt.** A line a command explicitly mandates is
NOT empty-state prose and this rule never suppresses it, even when it carries
an absence or a zero. The exempt set: the coverage/provenance header (its
attempt-based term and zero-note empty-state phrases); the permission-degrade
line; the redaction report, including its `nothing to strip` form;
`/lore:mine`'s floor found-or-none ("none"); `/lore:onboard` who-to-ask's
CODEOWNERS-fallback trigger statement and its "no ownership record" finding;
onboard orientation's "no migration evidence found in this repo for Z" line
(only for a specific visible Z); and `/lore:verify`'s sweep-counts line, its
outcome-counts line (after the decisions run), and its per-note
qualification-basis line. These are attestations a reader is owed; render them
under their own conditions. Anything NOT on this list and NOT backed by a
findings list does not render.

## Doc drift (`/lore:onboard` + `/lore:ask`)

When an answer or brief **cites or quotes a human doc** as the source for a
claim about code, spot-check that claim against the current tree before
citing. A human doc is **prose documentation** — README, files under `docs/`,
ADRs, wiki-style pages. `.lore/` notes and code comments are **never**
doc-drift targets: notes have their own `verified_sha` staleness machinery,
and comments live with the code they describe. Scope is **grep-verifiable
divergences ONLY** — a symbol, macro, file
path, command, or config key the doc references that verifiably does not exist
(or was renamed) in the current tree. Fixed wording:

`DOC DRIFT — <doc path> references <thing>, not found in current tree (<citation>); verify with an owner.`

This is an **observation, never an assertion** that the doc is wrong or that
current code says otherwise. INTERPRETIVE divergences (strategy, architecture,
"this approach was superseded") must **not** be flagged — at most "the doc and
current code may disagree here; verify with an owner", with both citations and
no verdict. Only docs the answer actually uses — never a repo-wide doc audit.
**Every spot-checked doc emits exactly one receipt line** — the DOC DRIFT
line above when drift was found, otherwise the aligned receipt
(`<doc path> — checked <claim → tree target> — aligned`). The
`<claim → tree target>` grain must be a **concrete symbol, macro, file
path, command, or config key** (the same scope list as the drift check
itself) —
never a free-text grain ("general accuracy" is not falsifiable and earns
nothing) — so the
`+ N docs spot-checked` header term and its receipt lines are one render
condition, not two: N receipt lines ⇔ the term renders with that N.
No `verified_sha` machinery — this is a live check, not note staleness.
**"STALE" stays reserved for git-deterministic note staleness; doc drift is a
separate observation flag.**

## Degrading under permission walls

When `git`/`gh` calls come back **blocked or denied** — or the session has
no shell tool to run them at all — do not grind through repeated denials,
and **do not reconstruct git history by reading `.git/` internals** (reflog,
`COMMIT_EDITMSG`, packed refs): a scrape of those files carries inferred,
unverified commit↔file links and is never a substitute for an executed
`git` command. In **one line**, say what was blocked; degrade to the
readable sources (Read/Grep on the tree, `.lore/` notes); and **label the gap
explicitly** in the coverage header / empty-state wording ("git history
unavailable in this session — brief is notes+tree-derived only"). Concretely:
the coverage header's `+ git history` term becomes `+ tree+notes only (git
unavailable)` — never claim git grounding the session didn't have. That
substitution applies **only when git history itself is unavailable**; if
only `gh` is blocked, git grounding stands — state the loss as the
PR-thread source only. **NEVER
recommend specific allowlist entries or permission changes** — unblocking is
the user's/admin's decision, not something to advise mid-session.

## Trust rules (when reading/answering)

- **Cite or admit ignorance.** Every claim traces to a `path:line`, a commit
  sha, or a note filename. If you cannot cite it, say "I don't know" and
  route the asker to a human (recent blame authors of the relevant paths,
  falling back to CODEOWNERS). One unverifiable claim kills trust.
- **Always show status + staleness.** When you surface a note, state whether
  it is confirmed or draft, and whether it is stale.
- **Label drafts.** Prefix draft notes with `(draft, unconfirmed)`.
- **Label stale notes.** When a note's file anchors changed since
  `verified_sha`, prefix it with `STALE — verify before trusting:`.
- **Footnote disputed notes.** See "Reading a dispute" above — never a
  prefix, never in place of the staleness label.

## Trust rule (when writing `status: confirmed`)

A note may be written `confirmed` only when the confirmer is:
- a blame author of a file anchor (for a directory anchor: of any file under
  it), **or**
- listed in CODEOWNERS for the anchored path.

If the repo has **no CODEOWNERS file at all**, any committer of an anchored
path qualifies (otherwise solo/new repos could never confirm anything).

Match on **email** (`git config user.email` vs blame `%ae`). If the
confirmer qualifies on none of these, write the note as `draft` — an owner
confirms it later in PR review or via `/lore:verify`. The ultimate gate is
ordinary PR review: notes are code.

## Batch capture is draft-only

`/lore:capture` with no arguments scans the current session for up to 3
durable candidate facts and presents them for triage. **Whatever is picked
is always written `status: draft`**, regardless of the picker's
blame/CODEOWNERS standing — the single-fact trust rule above never applies
in batch. Promotion to `confirmed` stays one-at-a-time, later, via
`/lore:verify`.

## Mine writes are gated

`/lore:mine` writes **no** `.lore/` file until the user's explicit go-ahead
after mine's present-for-review step has rendered. Before that point, **do
not call Write or Edit on any `.lore/` path** — mine renders its drafts as
exact file content, it does not persist them. An instruction to save given
before the present-for-review step renders is **not** the go-ahead; the
go-ahead exists only as the user's reply after it. The gate **defers** the
write, it does not forbid it: the same-session go-ahead write is legal and
**must not be refused** — declining to save approved drafts is as much a
contract failure as writing them unasked (a genuinely denied Write
permission is a degrade, not a refusal).

## Redaction checklist (before anything persists)

For present-for-review flows (mine, capture batch), redaction runs
**before the drafts render** — the rendered fenced content is already
redacted, byte-for-byte what a go-ahead writes; redacting between render
and write would silently break that equality, and rendering unredacted
content re-broadcasts it in-session.

Scan every draft and strip or abort on:
- credentials, tokens, API keys, secrets;
- internal hostnames / IP addresses;
- PII (names+contact tied to individuals, customer data);
- negative comments about named people.

**Ticket/tracker text** — a co-reference ticket ID, or ticket content
**quoted inside commit messages, PR bodies, or session text** a user pasted
in (`/lore:mine` does not fetch ticket bodies, but git/PR text can quote
ticket content and `/lore:capture` batch mode can meet pasted ticket text) —
additionally requires stripping, not just "negative comments about named
people":
- assignee / reporter / commenter names;
- status-change politics;
- team-vs-team escalation narrative.

When something is caught, **strip it or abort** — never persist unredacted.
**Report what redaction did without re-broadcasting the content:**
- **Strip path:** categories and counts only —
  `redaction pass: stripped <category: count, …>` — never the literal
  stripped strings; never qualify a count with role/area/ownership context
  that triangulates to a person. When external human-authored text was
  processed but nothing matched, render `redaction pass: nothing to strip`.
  This one-line report is rendered **iff** external human-authored text
  (commit-message quotes, PR/ticket/ADR quotes) was processed, and it
  doubles as proof the pass ran.
- **Abort path:** cite the **source pointer only** — "aborted: candidate
  from <TICKET-ID/sha> contained redaction-triggering content; inspect the
  source directly." Never staple the caught category next to a nameable
  source ID, and never re-broadcast the caught strings.

## Finding notes (grep recipes)

- All notes: read every file under `.lore/` if there are ≤30, else grep.
- Confirmed tripwires for a path:
  `grep -l 'kind: tripwire' .lore/*.md` then check `status:` and `anchors:`.
- Notes touching an area: `grep -rl '<path-or-keyword>' .lore/`.
- A note's metadata lives in the `---` frontmatter block at the top of each
  file; the fact is the body below it.
