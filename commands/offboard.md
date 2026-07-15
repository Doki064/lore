---
description: Capture a departing engineer's solo knowledge before they leave
argument-hint: [optional: areas to focus on]
---

Use the `using-lore` skill for the note format, redaction checklist, and
trust rule. The user is the departing engineer. Extract their bus-factor
knowledge into `.lore/` notes. `$ARGUMENTS`, if present, names areas to focus
on; otherwise find them:

1. **Bus-factor scan.** Over recently-active source paths, use
   `git log --format='%ae' -- <path>`-style queries (per directory first,
   drilling into files where a monopoly shows) to find areas where one
   author dominates authorship. Compare against the user's
   `git config user.email` — their monopolies are the priority list. Show it
   ranked.

2. **Interview, in context.** Work through the priority areas one at a time.
   For each: read the code and history first, then ask a few pointed
   questions — the why behind anything weird, the tripwires ("what breaks if
   someone touches this naively?"), the real runbook (deploy/migration steps
   as actually performed). A few questions at a time, never a wall.

3. **Draft, don't dictate.** No blank pages: draft each note yourself from
   what the code, history, and their answers show, and ask them to correct or
   confirm — never ask them to compose.

4. **Write through the capture rules.** Each confirmed draft goes through
   `/lore:capture`'s steps: dedup against existing notes, anchor lint (>20
   files in a directory anchor ⇒ suggest narrower), redaction checklist, then
   the trust rule — the departing engineer is a blame author of these
   anchors, so their confirmations qualify as `status: confirmed`.

5. **Wrap up.** Summarize what was captured and which priority areas remain
   uncovered, so a follow-up session can resume the list.
