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
   draft notes (J disputed)` followed by the provenance term — N/M count, by
   `status:`, the notes the answer body **cites by filename** (a note read in
   step 1 but not cited earns no count), J is the disputed overlay of those
   cited notes (either status carrying a `disputed:` line); all three derive
   from the composed body's own citation set, not recalled — compose the body
   first, then derive the counts and emit the header above it. The provenance
   term and the
   zero-note empty-state phrase are **attempt-based** per the skill's
   coverage-header rule and flip together: git executed → `+ git history`;
   git attempted-and-denied → the degrade substitution; git never attempted →
   `+ tree+notes (git history not needed for this answer)`. git history stays
   the default source for why/decision/history questions. When doc-drift
   spot-checks ran on docs the answer cites, the header also gains
   `+ N docs spot-checked`. If none of the notes gathered in step 1 answer
   this, say so plainly with the attempt-matched empty-state phrase — git
   executed: "no lore captured for this area yet — everything below is
   live-derived from git"; git never needed: "no lore captured for this area
   yet — everything below is derived from the tree and notes; git history
   wasn't needed here." Ground every claim in a
   `path:line`, a commit sha, or a note filename. Surface each note's
   `status` and staleness (label drafts `(draft, unconfirmed)` and stale
   notes `STALE — verify before trusting:`). Any disputed note carries the
   footnote: `⚠ unresolved dispute (<blame-author>, <blame-date> — not
   owner-verified): <reason>`, with author/date read live via `git
   blame`/`git log -1` on that note's `disputed:` line. If a claim here rests
   on a human doc you cite or quote as the source, spot-check it against the
   current tree first (the skill's doc-drift rule); on a grep-verifiable
   divergence emit `DOC DRIFT — <doc path> references <thing>, not found in
   current tree (<citation>); verify with an owner.` — only for docs the
   answer actually uses, never a repo-wide doc audit.

   **Confinement.** Keep the answer freeform, but anything step-shaped —
   unknowns routing, dispute footnotes, DOC DRIFT flags, and doc receipts —
   appears **only as flag lines in a flags position after the answer body**,
   one line each. A step that found nothing gets **no line anywhere**,
   including inside the answer prose — never a "searched and found nothing"
   sentence. A doc cited or quoted as the source for a claim **about code** is
   spot-checked (the skill's code-claim test); each spot-check performed
   renders exactly **one** receipt flag line — the DOC DRIFT line on a
   divergence, else `<doc path> — checked <claim → tree target> — aligned`
   (the skill's one-receipt-per-doc rule). A doc mentioned without sourcing a
   code claim earns neither spot-check nor receipt. The `+ N docs spot-checked`
   header term's N **equals the number of receipt lines rendered** (derived,
   not recalled), and it renders iff at least one is present.

   **Terminal pin.** After the flags position, only the step-4 capture offer
   and the step-5 dispute-raise offer below may render — each unchanged and
   only in its shipped condition; nothing else renders after the flags. That
   includes methodology asides: a parenthetical about how the answer was
   derived ("*(git history isn't the crux here — the answer is grep- and
   tree-derived)*" is the banned shape) renders nowhere — not after the
   flags, not in the body; the header's provenance term already carries the
   sourcing.

3. **Unknown.** If lore and the repo do not answer it, say "I don't know" and
   route the asker to a human: recent blame authors of the relevant paths,
   falling back to CODEOWNERS when the last author has not committed in >6
   months or is absent from the recent log. If git itself is blocked or
   denied, routing degrades per the skill's permission-walls rule —
   git-unavailability is never read as a stale/absent author signal.

4. **Close the loop.** If you just resolved something that was previously
   unknown, offer `/lore:capture` so the answer is only worked out once.

5. **Offer to raise a dispute.** If the asker contradicts a note you
   surfaced and backs it with checkable evidence (a sha, a PR, current
   code), offer to add a `disputed: <their reason + evidence>` line to that
   note's frontmatter. Explain that this doesn't resolve anything by itself
   — an owner resolves it via `/lore:verify`. Never change `status:` and
   never edit the note's body in the same breath as adding the dispute.
