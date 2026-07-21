#!/usr/bin/env node
// lore onboarding-session persistence hook (UserPromptSubmit).
// Detects a `/lore:onboard` prompt (raw pre-expansion stdin `prompt`,
// live-verified 2026-07-21), persists a session-id-keyed marker in
// per-user tmpdir (tripwire.js's marker pattern — NEVER a file in the
// consumer repo), and on every later prompt in that same session injects
// one fixed background-grounding line via additionalContext. Session-id
// mismatch is inert by construction: the marker filename IS the session id,
// so a resumed/cleared session with a different id simply finds no marker.
// No TTL, no cross-session re-injection; stale markers are inert, tiny, and
// left to the OS tmpdir policy (same accepted decision as tripwire markers).
//
// Every failure path exits 0 silently (CLAUDE.md hook contract): a broken
// hook that blocks or spams is worse than no feature. Zero-dep Node, no
// bash/jq/awk — runs on Windows too.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// Any failure => stay silent (exit 0). A broken hook must never block or spam.
function bail() { process.exit(0); }

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch (e) { bail(); }

let data;
try {
  data = JSON.parse(input);
} catch (e) { bail(); }

const sid = (data && data.session_id) || '';
const prompt = (data && typeof data.prompt === 'string') ? data.prompt : '';
if (!sid || /[\\/]/.test(sid)) bail(); // sid names a file — never let it traverse

const trimmed = prompt.trim();

// Per-user marker dir, same predictable-shared-/tmp defense as tripwire.js.
const uid = typeof process.getuid === 'function' ? process.getuid() : os.userInfo().username;
const tmp = path.join(os.tmpdir(), 'lore-' + uid);
const marker = path.join(tmp, 'onboard-' + sid);

// Invocation shapes live-probed 2026-07-21: the command executes at byte 0
// and behind bracketed prefix tags ("[general] /lore:onboard …"), but not as
// a mid-sentence mention — arm on exactly those; token boundary keeps
// prefix-sharing siblings (/lore:onboarding) out.
const INVOKE = /^(?:\[[^\]]*\]\s*)*\/lore:onboard(?=\s|$)/;
const invoked = trimmed.match(INVOKE);
if (invoked) {
  try { fs.mkdirSync(tmp, { recursive: true, mode: 0o700 }); } catch (e) { bail(); }

  // Scope reaches model context on every later prompt — keep it one short line.
  const scope = trimmed.slice(invoked[0].length).trim()
    .replace(/\s+/g, ' ').slice(0, 200);
  const tmpFile = marker + '.tmp-' + process.pid;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify({ scope, ts: Date.now() }));
    fs.renameSync(tmpFile, marker); // atomic: no reader ever sees a partial marker
  } catch (e) { bail(); }

  process.exit(0); // onboard-prompt detection path: NO stdout
}

// Not an onboard prompt: inject only if THIS session has an active marker.
let raw;
try {
  raw = fs.readFileSync(marker, 'utf8');
} catch (e) { bail(); } // no marker for this session_id => inert

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) { bail(); }

// Re-cap/flatten on read: the marker is a plain file and may be hand-edited.
const scope = (parsed && typeof parsed.scope === 'string')
  ? parsed.scope.replace(/\s+/g, ' ').slice(0, 200).trim()
  : '';
const scopeText = scope || 'this repo';

const line = `lore: onboarding active for ${scopeText} — ground answers in `
  + `.lore/, cite notes by filename; use /lore:ask for lore questions.`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: line,
  },
}) + '\n');
process.exit(0);
