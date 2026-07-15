---
name: using-lore
description: This skill should be used when reading or writing `.lore/` knowledge notes, answering questions from team lore, or capturing tribal knowledge.
version: 0.2.0
---

# Using lore

`.lore/` is a directory of markdown knowledge notes in the target repo. One
note = one fact. Notes are versioned, greppable, and PR-reviewed like code.
This skill is the shared contract every `/lore:*` command obeys. Read it
whenever you read or write a note.

## Note format

One note = one file: `.lore/<kind>-<slug>.md`, slug kebab-cased from the
note's first body line, e.g. `.lore/tripwire-reconciler-migration.md`. On
filename collision, append `-2`, `-3`.

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
- `verified_sha` + `verified_date`: the commit and date of the last human
  confirmation. A note is **stale** when any *file* anchor changed since
  `verified_sha`:
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
`grounded in: N confirmed + M draft notes (J disputed) + git history`. N/M
count by `status:`; J is an **overlay count** of notes (of either status)
carrying a `disputed:` line — never a third status bucket. Counts are
scoped to what the answer actually used. **Zero-note case must say so
explicitly**: "no lore captured for this area yet — everything below is
live-derived from git." Empty is stated, never silently omitted.

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

## Redaction checklist (before anything persists)

Scan every draft and strip or abort on:
- credentials, tokens, API keys, secrets;
- internal hostnames / IP addresses;
- PII (names+contact tied to individuals, customer data);
- negative remarks about named people.

If something is caught, either strip it or abort and tell the user exactly
what was caught. Never persist unredacted.

## Finding notes (grep recipes)

- All notes: read every file under `.lore/` if there are ≤30, else grep.
- Confirmed tripwires for a path:
  `grep -l 'kind: tripwire' .lore/*.md` then check `status:` and `anchors:`.
- Notes touching an area: `grep -rl '<path-or-keyword>' .lore/`.
- A note's metadata lives in the `---` frontmatter block at the top of each
  file; the fact is the body below it.
