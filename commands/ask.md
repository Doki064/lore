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

2. **Answer.** The answer opens with the coverage header — **byte one;
   nothing renders before it**: no title heading ("## Answer" is the banned
   shape), no scene-setting, no restatement of the question. The answer is
   composed in full first, then emitted as one uninterrupted block
   beginning at the header (the skill's compose-then-emit rule); a
   readiness or transition sentence and a pre-header separator line are the
   banned shapes — "Everything checks out against the current tree.
   Composing the answer.", "This confirms it: …", `Now I have everything
   needed.`, and `Have everything needed. Composing the answer.` are the
   banned shape, as is any verification recap or conclusion
   sentence ahead of the header, and as is a `---` rule line (or any
   separator line) rendered before the header;
   a conclusion drawn from the final check opens the body AFTER the header,
   never the message. The final message's first byte is the header's own
   first byte. The header:
   `grounded in: N confirmed + M
   draft notes (J disputed)` followed by the provenance term — N/M count, by
   `status:`, the notes the answer body **cites by filename** (a note read in
   step 1 but not cited earns no count), J is the disputed overlay of those
   cited notes (either status carrying a `disputed:` line); all three **are
   the composed citation set's lengths** (the skill's coverage-header rule:
   one entry per note the body cites by filename, with its status; N = its
   confirmed entries, M = its draft entries, J = its disputed overlay) —
   compose the body first, derive the counts from the set, then emit the
   header above it. Each entry's status comes from that note's frontmatter
   `status:` line as read this session — a cited draft is always M, never
   N, and a cited confirmed note is always N, never M: the header's counts
   and the flags line's own status labels derive from the same composed set
   and can never disagree (a flags line labeling two notes `draft` under a
   header claiming `2 confirmed + 0 draft` is the banned outcome, whichever
   direction the inversion runs). A note read but not cited is invisible to the answer: no count, no
   flags line, no "read but not cited" mention. Per the skill's
   coverage-header rule, **a note filename rendered anywhere in the composed
   output is a citation and is counted; a note not counted is never named** —
   and an answer whose substance is absence names no notes — the
   honest-absence wording carries the diligence, filenames stay out. The provenance
   term and the
   zero-note empty-state phrase are **attempt-based** per the skill's
   coverage-header rule and flip together: git executed → `+ git history`;
   git attempted-and-denied → the degrade substitution; git never attempted →
   `+ tree+notes (git history not needed for this answer)`. Exactly one of
   the three pinned terms renders — never a hand-composed variant
   (`+ tree + git history` is the banned shape). git history stays
   the default source for why/decision/history questions. When doc-drift
   spot-checks ran on docs the answer cites, the header also gains
   `+ N docs spot-checked`. If none of the notes gathered in step 1 answer
   this, say so plainly with the attempt-matched empty-state phrase — git
   executed: "no lore captured for this area yet — everything below is
   live-derived from git"; git never needed: "no lore captured for this area
   yet — everything below is derived from the tree and notes; git history
   wasn't needed here." The phrase renders directly under the header in its
   fixed wording — never repositioned to the end, never reworded to match a
   different position ("everything above" is the banned edit), never
   extended with a reason clause. Ground every claim in a
   `path:line`, a commit sha, or a note filename. Surface each note's
   `status` and staleness (label drafts `(draft, unconfirmed)` and stale
   notes `STALE — verify before trusting:`). Surfacing a status label
   REQUIRES the staleness check behind it: every cited note's file anchors
   are checked against its `verified_sha` (the skill's staleness rule)
   before its label renders — a stale note rendered with a bare
   `(confirmed)` and no STALE prefix is a trust failure, the exact class
   the tripwire exists to prevent. Any disputed note carries the
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
   spot-checked (the skill's code-claim test); each spot-check composes one
   entry on the **spot-check list** — the doc, the concrete grain(s) checked,
   and the verdict — built with the answer, not recalled after. The flags
   position renders exactly **one** receipt line per list entry (one per doc —
   multiple grains on one doc fold into that doc's single line) — the DOC
   DRIFT line on a divergence, else `<doc path> — checked <claim → tree
   target> — aligned` (the skill's one-receipt-per-doc rule). A doc mentioned
   without sourcing a code claim earns no entry, no spot-check, and no
   receipt. The `+ N docs spot-checked` header term's N **is the spot-check
   list's length** (derived from the composed list, not recalled), and the
   term renders iff the list is non-empty — zero entries ⇒ no term and no
   receipt lines.

   **Terminal pin.** After the flags position, only the step-4 capture offer
   and the step-5 dispute-raise offer below may render — entries 1 and 2 of
   the skill's sanctioned-pointer table, each rendering only when its listed
   condition held this session; any other next-step pointer (a `/lore:verify`
   nudge, an unprompted capture offer, and `/lore:ask` itself — an ask answer
   never offers `/lore:ask`; "/lore:ask for further questions." is the banned
   shape, including when injected session context mentions the command) is
   unsanctioned and renders nowhere
   after the flags. That
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

4. **Close the loop.** Offer `/lore:capture` **only** when this session
   resolved a specific fact that was previously unknown and that no `.lore/`
   note already covered — so the answer is worked out only once (the skill's
   sanctioned-pointer table, entry 1). The **absence** of lore for this area
   is never itself the trigger: a thin or empty `.lore/` does not earn the
   offer; a fact must have been resolved this session. The condition cuts
   both ways (the table's polarity rule): when this session DID resolve such
   a fact — an investigation concluded, a mechanism worked out, and no note
   covers it — the offer **renders**; omitting it then is the same failure
   as suppressing a mandated attestation.

5. **Offer to raise a dispute.** If the asker contradicts a note you
   surfaced and backs it with checkable evidence (a sha, a PR, current
   code), offer to add a `disputed: <their reason + evidence>` line to that
   note's frontmatter. Explain that this doesn't resolve anything by itself
   — an owner resolves it via `/lore:verify`. Never change `status:` and
   never edit the note's body in the same breath as adding the dispute.
