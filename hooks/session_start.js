#!/usr/bin/env node
// lore session-start awareness line (SessionStart hook).
// The one consciously-pull-relaxed surface: a pointer, not content. If the
// project has a .lore/ with at least one note, emit a single structured line
// into model context so the session knows lore exists and how to ground in it
// (/lore:ask, /lore:onboard, /lore:capture). No behavioral instructions, fires
// ≤1×/session by construction, silent forever on repos without lore.
//
// The awareness line reaches the model via hookSpecificOutput.additionalContext
// (the documented SessionStart→context channel; live-verified 2026-07-14).
// Reads no stdin, keeps no state, denies nothing. Every failure path exits 0
// with NO output: build the whole line in memory, single stdout write at the
// end. Node >=16, zero deps, no bash/jq/awk — runs on Windows too.
//
// The frontmatter scan below is deliberately NOT shared with tripwire.js's
// readNote: ~10 lines of duplication beats coupling the gate to a second
// consumer.
'use strict';

const fs = require('fs');
const path = require('path');

// Any failure or nothing-to-say => stay silent (exit 0, no output).
function bail() { process.exit(0); }

const dir = process.env.CLAUDE_PROJECT_DIR;
if (!dir) bail();

const loreDir = path.join(dir, '.lore');
let entries;
try {
  entries = fs.readdirSync(loreDir);
} catch (e) { bail(); } // .lore/ absent (or unreadable) => silent

// Local frontmatter scan: true iff the file has `status: confirmed` between the
// first two `---` lines. First match wins, CR-trimmed for Windows checkouts.
function isConfirmed(f) {
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch (e) { return false; }
  let dashes = 0;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (/^---\s*$/.test(line)) { dashes++; if (dashes >= 2) break; continue; }
    if (dashes !== 1) continue;
    const m = line.match(/^status:\s*(.*?)\s*$/);
    if (m) return m[1] === 'confirmed';
  }
  return false;
}

let n = 0;
let m = 0;
for (const name of entries) {
  if (!/\.md$/.test(name)) continue;
  const f = path.join(loreDir, name);
  try { if (!fs.statSync(f).isFile()) continue; } catch (e) { continue; } // non-recursive
  n++;
  if (/^tripwire-.*\.md$/.test(name) && isConfirmed(f)) m++;
}

if (n === 0) bail(); // nothing to ground in; onboard's mining-first path covers empty repos

const line = `lore: ${n} note(s) (${m} confirmed tripwire(s)) in .lore/. `
  + `Ground answers in them: /lore:ask <question>, /lore:onboard <area>. `
  + `Capture new durable facts with /lore:capture.`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: line,
  },
}) + '\n');
process.exit(0);
