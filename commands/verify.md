---
description: Sweep lore notes for staleness and promote drafts
---

Use the `using-lore` skill for the note format, staleness definition, and the
write-side trust rule. Run a staleness sweep over this repo's `.lore/`.

1. **Sweep.** For each note, check staleness: for every *file* anchor, run
   `git -C "$CLAUDE_PROJECT_DIR" diff --name-only <verified_sha>..HEAD -- <anchor>`.
   Non-empty output means stale. If `verified_sha` does not resolve
   (`git cat-file -e <sha>^{commit}` fails — rebased away, shallow clone),
   the note is stale. Directory anchors never trigger staleness.

2. **Walk stale notes.** Present each stale note (body, anchors, what changed
   since `verified_sha` — a short `git log --oneline <sha>..HEAD -- <anchors>`
   helps) and ask the user to pick one of three outcomes:
   - **re-confirm** — the fact still holds: bump `verified_sha` to current
     HEAD, `verified_date` to today, `confirmed_by` to the user's git name.
   - **update** — the fact changed: edit the body with the user, then
     re-confirm as above.
   - **retire** — the fact is dead: delete the file. Git history is the
     archive; no tombstones.

3. **Promote drafts.** List `status: draft` notes. For each the user vouches
   for, apply the skill's write-side trust rule (email match against
   blame/CODEOWNERS of the anchors): if the user qualifies, set
   `status: confirmed` plus `confirmed_by`/`verified_sha`/`verified_date`;
   if not, tell them who does qualify and leave it draft.

4. **Summarize.** Report counts: fresh / re-confirmed / updated / retired /
   promoted / still-draft.
