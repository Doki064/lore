---
description: Seed draft lore notes from git history, PR reviews, ADRs, and CODEOWNERS
---

Use the `using-lore` skill for the note format and redaction checklist. Mine
this repo for candidate lore. Everything mined stays `status: draft`; cap the
run at **5** drafts total — pick the strongest signals across all sources.

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

Then:

5. **Redact.** Run the skill's redaction checklist over every draft. PR and
   ADR text is human-written — be especially alert for named-person
   negativity and internal hostnames.

6. **Present.** Show the drafts for review — do not confirm them, do not
   write files without the user's go-ahead. The user promotes them later via
   `/lore:verify` or PR review.
