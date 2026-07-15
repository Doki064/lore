# lore — Claude Code plugin for knowledge transfer

One note = one fact = one anchored markdown file in the target repo's
`.lore/`. This repo is the plugin itself (commands are prompt markdown; the
only runtime code is the tripwire hook).

## Commands

- Test: `node tests/hook_test.js` — must also pass on an immediate second
  run (marker idempotency is part of the contract).
- Local dev install: `claude plugin marketplace add <this repo> && claude
  plugin install lore@lore`. Hooks load at session start — restart Claude
  Code after any hook change before live-testing.

## Contract rules (violating these breaks the product, not just style)

- Plans live one-per-version under `docs/plans/` and freeze at release.
  The **newest** `VXX-PLAN.md` is canonical — its §2 (data model) and §3
  (component specs) — and `skills/using-lore/SKILL.md` restates them for
  runtime. Change one ⇒ change both, then re-run the relevant validator
  (plugin-validator / skill-reviewer). Never edit a frozen older plan.
- The tripwire hook is a **deny-once gate**: deny the first matching edit
  with the warning as the reason; the session marker is persisted *before*
  the deny so the retry passes. Never deny unless the marker write
  succeeded — denying without it locks the edit out forever.
- Do not "simplify" the gate back to allow + `systemMessage`: the harness
  drops `systemMessage` on PreToolUse allow decisions (verified on Claude
  Code 2.1.209) — the model never sees it. The deny reason is the only
  channel that reaches the model pre-edit.
- Every hook failure path exits 0 silently. A broken hook that blocks or
  spams edits is worse than no warning.
- Commands must invoke the `using-lore` skill **by name** — skill autoload
  is not reliable enough to carry the trust contract.

## Docs (read on demand)

- docs/plans/ — one frozen plan per version; the newest VXX-PLAN.md is the
  full current design (data model, component specs, review history, build
  phases).
- docs/EXAMPLE.md — end-to-end usage walkthrough.
