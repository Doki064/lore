---
description: Answer a question grounded in team lore, with citations
argument-hint: <question>
---

Use the `using-lore` skill for trust rules and how to find notes. Answer the
question in `$ARGUMENTS` grounded in this repo's `.lore/` notes, the code, and
git history.

1. **Gather.** If `.lore/` has ≤30 notes, read all of them into context.
   Otherwise grep note bodies and frontmatter for the question's keywords and
   read the matches.

2. **Answer.** Open with the coverage header: `grounded in: N confirmed + M
   draft notes (J disputed) + git history` — N/M count by `status:` among
   the notes actually used, J is an overlay count of those (either status)
   carrying a `disputed:` line. If none of the notes gathered in step 1
   answer this, say so plainly: "no lore captured for this area yet —
   everything below is live-derived from git." Ground every claim in a
   `path:line`, a commit sha, or a note filename. Surface each note's
   `status` and staleness (label drafts `(draft, unconfirmed)` and stale
   notes `STALE — verify before trusting:`). Any disputed note carries the
   footnote: `⚠ unresolved dispute (<blame-author>, <blame-date> — not
   owner-verified): <reason>`, with author/date read live via `git
   blame`/`git log -1` on that note's `disputed:` line.

3. **Unknown.** If lore and the repo do not answer it, say "I don't know" and
   route the asker to a human: recent blame authors of the relevant paths,
   falling back to CODEOWNERS when the last author has not committed in >6
   months or is absent from the recent log.

4. **Close the loop.** If you just resolved something that was previously
   unknown, offer `/lore:capture` so the answer is only worked out once.

5. **Offer to raise a dispute.** If the asker contradicts a note you
   surfaced and backs it with checkable evidence (a sha, a PR, current
   code), offer to add a `disputed: <their reason + evidence>` line to that
   note's frontmatter. Explain that this doesn't resolve anything by itself
   — an owner resolves it via `/lore:verify`. Never change `status:` and
   never edit the note's body in the same breath as adding the dispute.
