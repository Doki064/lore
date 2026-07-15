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

2. **Answer.** Ground every claim in a `path:line`, a commit sha, or a note
   filename. Surface each note's `status` and staleness (label drafts
   `(draft, unconfirmed)` and stale notes `STALE — verify before trusting:`).

3. **Unknown.** If lore and the repo do not answer it, say "I don't know" and
   route the asker to a human: recent blame authors of the relevant paths,
   falling back to CODEOWNERS when the last author has not committed in >6
   months or is absent from the recent log.

4. **Close the loop.** If you just resolved something that was previously
   unknown, offer `/lore:capture` so the answer is only worked out once.
