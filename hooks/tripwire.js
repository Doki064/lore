#!/usr/bin/env node
// lore tripwire hook (PreToolUse: Edit|Write|MultiEdit).
// Deny-once gate: when the edited file is guarded by a confirmed lore
// tripwire, deny ONCE with the warning as the reason — the only PreToolUse
// channel that verifiably reaches the model (systemMessage on an allow
// decision is silently dropped by the harness as of Claude Code 2.1.209).
// The session marker is persisted before the deny, so the immediate retry of
// the same edit passes silently (empty stdout = allow): trip, read the sign,
// step over. One deny per note per {fresh,stale} state per session; a
// fresh->stale transition re-alerts once. A broken hook is worse than no
// warning, so every failure path exits 0 silently — and we never deny unless
// the marker that lets the retry through was actually written.
//
// Node port of the original tripwire.sh: no jq/bash/awk, so it runs on Windows
// too. Contract is identical, byte-for-byte on the output shape and messages.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const slash = (s) => s.replace(/\\/g, '/'); // normalize to repo-relative forward slashes

// Any failure => stay silent (exit 0). A broken hook must never block edits.
function bail() { process.exit(0); }

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch (e) { bail(); }

let data;
try {
  data = JSON.parse(input);
} catch (e) { bail(); }

const dir = process.env.CLAUDE_PROJECT_DIR;
if (!dir) bail();
const dirNorm = slash(dir);
if (!fs.existsSync(path.join(dir, '.lore'))) bail();

const file = (data && data.tool_input && data.tool_input.file_path) || '';
const sid = (data && data.session_id) || 'nosession';
if (!file) bail();

// Relativize; never warn on edits to the notes themselves. Anchors are always
// forward-slash repo-relative, so match on the normalized strings.
let rel = slash(file);
const prefix = dirNorm + '/';
if (rel.startsWith(prefix)) rel = rel.slice(prefix.length);
if (rel === '.lore' || rel.startsWith('.lore/')) bail();

// Frontmatter parsing: fields live between the first two `---` lines. Trim CR
// for Windows checkouts.
function readNote(f) {
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch (e) { return null; }
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  const fields = {};
  const anchors = [];
  const body = [];
  let dashes = 0; // count of `---` separator lines seen
  let inAnchors = false;
  for (const line of lines) {
    if (/^---\s*$/.test(line)) { dashes++; inAnchors = false; continue; }
    if (dashes >= 2) { body.push(line); continue; }
    if (dashes !== 1) continue; // before first --- : ignore
    // inside frontmatter (dashes === 1)
    if (inAnchors) {
      const m = line.match(/^\s*-\s*(.*?)\s*$/);
      if (m) { if (m[1] !== '') anchors.push(m[1]); continue; }
      if (/^\S/.test(line)) inAnchors = false; // dedent out of the anchors block
    }
    if (/^anchors:/.test(line)) { inAnchors = true; continue; }
    const fm = line.match(/^([^:]+):\s*(.*?)\s*$/);
    if (fm && !(fm[1] in fields)) fields[fm[1]] = fm[2]; // first match wins
  }
  // Shell `$(...)` strips trailing newlines; match that so the message text is
  // byte-identical to the bash version.
  return { fields, anchors, body: body.join('\n').replace(/\n+$/, '') };
}

// Per-user marker dir: predictable names in shared /tmp are pre-createable /
// symlinkable by other users. mkdir failure -> silent exit (broken hook rule).
// os.tmpdir() honors TMPDIR on POSIX, which the test suite relies on.
const uid = typeof process.getuid === 'function' ? process.getuid() : os.userInfo().username;
const tmp = path.join(os.tmpdir(), 'lore-' + uid);
try { fs.mkdirSync(tmp, { recursive: true, mode: 0o700 }); } catch (e) { bail(); }

const messages = [];

let notes = [];
try {
  notes = fs.readdirSync(path.join(dir, '.lore'))
    .filter((n) => /^tripwire-.*\.md$/.test(n));
} catch (e) { bail(); }

for (const name of notes) {
  const f = path.join(dir, '.lore', name);
  try { if (!fs.statSync(f).isFile()) continue; } catch (e) { continue; }

  const note = readNote(f);
  if (!note) continue;
  if (note.fields.status !== 'confirmed') continue;

  let matched = false;
  const fileanchors = [];
  for (const anchor of note.anchors) {
    if (!anchor) continue;
    if (anchor.endsWith('/')) {
      // directory anchor: informational only, prefix match
      if (rel.startsWith(anchor)) matched = true;
    } else {
      fileanchors.push(anchor);
    }
    if (rel === anchor) matched = true;
  }
  if (!matched) continue;

  // Staleness (computed BEFORE dedupe: it is part of the dedupe key).
  // Unreachable verified_sha => STALE, never fresh.
  const sha = note.fields.verified_sha || '';
  let stale = false;
  if (!sha) {
    stale = true;
  } else {
    try {
      execFileSync('git', ['-C', dir, 'cat-file', '-e', sha + '^{commit}'], { stdio: 'ignore' });
    } catch (e) {
      stale = true;
    }
    if (!stale && fileanchors.length > 0) {
      try {
        const changed = execFileSync(
          'git',
          ['-C', dir, 'diff', '--name-only', sha + '..HEAD', '--', ...fileanchors],
          { encoding: 'utf8' }
        );
        if (changed.trim() !== '') stale = true;
      } catch (e) { /* git failure: leave fresh, matching the sh `2>/dev/null` empty */ }
    }
  }
  const state = stale ? 'stale' : 'fresh';

  // Dedupe: one warning per note per state per session. basename because the
  // raw note path contains '/'. A fresh->stale transition re-alerts once.
  const marker = path.join(tmp, `lore-${sid}-${path.basename(f)}-${state}`);
  try { if (fs.existsSync(marker)) continue; } catch (e) { continue; }
  // Marker write failed => skip the warning rather than deny: a deny whose
  // retry would be denied again is a lockout, not a tripwire.
  try { fs.writeFileSync(marker, ''); } catch (e) { continue; }

  const notefile = slash(f).startsWith(prefix) ? slash(f).slice(prefix.length) : slash(f);
  const who = note.fields.confirmed_by || '';
  const when = note.fields.verified_date || '';

  let msg = `TRIPWIRE for ${rel} (${notefile}, confirmed by ${who} on ${when}): ${note.body}`;
  if (stale) msg = `STALE — verify before trusting: ${msg}`;
  messages.push(msg);
}

if (messages.length === 0) bail();

// Deny ONCE with the warning as the reason — the only PreToolUse channel that
// verifiably reaches the model (systemMessage on allow is dropped by the
// harness as of Claude Code 2.1.209). Markers are already written above, so
// the immediate retry passes silently: trip, read the sign, step over.
let reason = messages.join('\n\n');
reason += '\n\n(lore tripwire gate: warning delivered, marker set — retry the same edit now and it will go through.)';

process.stdout.write(JSON.stringify({
  decision: 'block',
  reason,
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
  systemMessage: reason,
}) + '\n');
process.exit(0);
