---
description: Draft a lore note from the current session and confirm it
argument-hint: [optional: what to capture]
---

Use the `using-lore` skill for the note format, trust rules, and redaction
checklist. Capture one fact from the current session into `.lore/` of this
repo. `$ARGUMENTS`, if present, names what to capture; otherwise infer it
from what just happened.

Follow these steps in order:

1. **Draft.** Write the note body (one fact, plainly) and frontmatter per the
   skill's format. Set `verified_sha` to current HEAD
   (`git -C "$CLAUDE_PROJECT_DIR" rev-parse --short HEAD`), `verified_date`
   to today. Choose `anchors` as repo-relative literal file paths (or a
   directory prefix ending in `/`) for the code the fact is about — no anchor
   means no trust, so insist on at least one.

2. **Dedup check.** Grep `.lore/` for notes whose anchors overlap the new
   note's anchors. If one exists, show it and offer to update it instead of
   creating a new note.

3. **Anchor lint.** For any directory anchor, run
   `git -C "$CLAUDE_PROJECT_DIR" ls-files <dir> | wc -l`. If it covers >20
   files, suggest replacing it with narrower file anchors.

4. **Redaction.** Run the skill's redaction checklist over the draft. Strip
   what you can; if you must abort, tell the user exactly what was caught.

5. **Trust + write.** Apply the skill's confirmed-vs-draft trust rule (match
   on `git config user.email` against blame/CODEOWNERS of the anchors) to set
   `status`. Show the finished note to the user. On one confirmation from
   them, write the file to `.lore/<kind>-<slug>.md` (append `-2`, `-3` on
   filename collision).
