---
description: Sweep lore notes for staleness and promote drafts
---

Use the `using-lore` skill for the note format, staleness definition, and the
write-side trust rule. Run a sweep over this repo's `.lore/`, in this order:
**disputed notes first, then stale notes, then draft promotion.**

1. **Sweep.** For each note, check staleness: for every *file* anchor, run
   `git -C "$CLAUDE_PROJECT_DIR" diff --name-only <verified_sha>..HEAD -- <anchor>`.
   Non-empty output means stale. If `verified_sha` does not resolve
   (`git cat-file -e <sha>^{commit}` fails — rebased away, shallow clone),
   the note is stale. Directory anchors never trigger staleness.

   Also check retire-candidacy: for every *file* anchor (never a directory
   anchor), run
   `git -C "$CLAUDE_PROJECT_DIR" ls-files --error-unmatch -- <anchor>`. A
   nonzero exit means the anchor no longer exists in the tree — flag the
   note as a **retire candidate** regardless of its staleness or dispute
   state; the code the fact describes is gone.

   Also identify disputed notes: grep `.lore/*.md` frontmatter for a
   `disputed:` line.

2. **Walk disputed notes first.** For each note carrying a `disputed:` line,
   show the footnote: `⚠ unresolved dispute (<blame-author>, <blame-date> —
   not owner-verified): <reason>`, with author/date read live via `git
   blame`/`git log -1` on that `disputed:` line — that's the disputer and
   the dispute age. Also show what changed in the anchors since
   `verified_sha` (a short `git log --oneline <verified_sha>..HEAD --
   <anchors>` helps). If the dispute is older than ~90 days, flag it: "stale
   dispute — resolve it or it is noise." If step 1 also flagged the note a
   retire candidate, say so here. Ask the user to pick one of the same three
   outcomes as stale notes:
   - **re-confirm** — the fact still holds: clear the `disputed` line, bump
     `verified_sha` to current HEAD, `verified_date` to today, `confirmed_by`
     to the user's git name.
   - **update** — the fact changed: edit the body with the user, then
     re-confirm as above (also clears `disputed`).
   - **retire** — the fact is dead: delete the file. Git history is the
     archive; no tombstones.

   A note resolved here is done — do not walk it again in step 3 even if it
   was also stale.

3. **Walk remaining stale notes.** Present each stale note not already
   resolved in step 2 (body, anchors, what changed since `verified_sha`, and
   whether step 1 flagged it a retire candidate) and ask the user to pick one
   of the same three outcomes: **re-confirm**, **update**, or **retire**, as
   above.

4. **Promote drafts.** List `status: draft` notes. For each the user vouches
   for, apply the skill's write-side trust rule (email match against
   blame/CODEOWNERS of the anchors): if the user qualifies, set
   `status: confirmed` plus `confirmed_by`/`verified_sha`/`verified_date`;
   if not, tell them who does qualify and leave it draft.

5. **Summarize.** Report counts: fresh / re-confirmed / updated / retired /
   promoted / still-draft, plus disputed-resolved (disputes cleared or
   retired in step 2), stale-disputes (disputes flagged >90 days old in step
   2), and retire-candidates (notes flagged in step 1, whether or not the
   user retired them).
