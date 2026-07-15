---
description: Assemble a work-scoped onboarding brief for a ticket or area
argument-hint: [ticket, file path, or area]
---

Use the `using-lore` skill for trust rules and staleness labeling. Assemble a
**brief scoped to the named work — not a wiki tour**. `$ARGUMENTS` names the
ticket, file path, or area; if absent, ask what they'll be working on before
doing anything else.

1. **Resolve the scope.** Map the ticket/area to concrete repo paths (grep
   for keywords, follow imports). Everything below is restricted to those
   paths — omit anything not relevant to this work.

2. **Tripwires first, prominently.** Surface every confirmed `.lore/`
   tripwire whose anchors cover the scoped paths, at the top of the brief,
   staleness-labeled per the skill.

3. **Relevant notes.** Other `.lore/` notes (why/runbook/coupling/glossary)
   anchored to or mentioning the scoped paths, each labeled with status
   (`(draft, unconfirmed)`) and staleness per the skill.

4. **Decision history, live.** `git log --oneline -- <paths>` for the scoped
   paths: summarize the notable decisions — reverts, incident fixes, PR
   references in commit messages — with shas cited. Keep it to what a person
   starting this ticket needs.

5. **Who to ask.** Recent blame authors of the scoped paths
   (`git log --format='%an <%ae>' -- <path>` on the recent history). If the
   last author hasn't committed in >6 months or is absent from the repo's
   recent log, fall back to CODEOWNERS for those paths.

6. **Close.** Keep the whole brief short; cite every claim (path:line, sha,
   or note filename) per the skill. End by offering `/lore:ask` for
   follow-up questions.
