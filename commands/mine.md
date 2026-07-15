---
description: Seed draft lore notes from git history (cold start)
---

Use the `using-lore` skill for the note format and redaction checklist. Mine
this repo's history for candidate lore to kill the cold-start problem.

1. **Scan.** Read `git log` for reverts and for commits keyed on
   incident/fix/workaround/hotfix language, restricted to files that still
   exist in the tree.

2. **Draft.** From the strongest signals, draft up to **5** notes with
   `status: draft`. Set `source:` to the commit sha(s) the note came from and
   `anchors:` to the still-existing files involved.

3. **Redact.** Run the skill's redaction checklist over every draft.

4. **Present.** Show the drafts for review — do not confirm them. The user
   promotes them later via `/lore:capture` or PR review.
