#!/usr/bin/env node
// Unit test for hooks/tripwire.js. Builds a temp git repo fixture with a
// scratch TMPDIR, exercises asserts (a)-(h), tears down. Non-zero exit on any
// failure. Self-contained: passes on repeat runs (markers live in the scratch
// tmp dir, wiped at teardown). Zero dependencies, Node >=16, runs on Windows.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HOOK = path.join(__dirname, '..', 'hooks', 'tripwire.js');
let fails = 0;

const pass = (m) => console.log(`ok   - ${m}`);
const fail = (m) => { console.log(`FAIL - ${m}`); fails++; };

// --- setup: temp git repo + scratch tmp dir --------------------------------
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'lore-test-'));
const REPO = path.join(WORK, 'repo');
const SCRATCH = path.join(WORK, 'tmp');
fs.mkdirSync(REPO, { recursive: true });
fs.mkdirSync(SCRATCH, { recursive: true });

const git = (...args) => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' });

try {
  git('init', '-q');
  git('config', 'user.email', 'tester@example.com');
  git('config', 'user.name', 'Tester');

  for (const d of ['src/billing', 'migrations', 'lib', '.lore']) {
    fs.mkdirSync(path.join(REPO, ...d.split('/')), { recursive: true });
  }
  const write = (rel, s) => fs.writeFileSync(path.join(REPO, ...rel.split('/')), s);
  write('src/billing/reconciler.py', 'def reconcile(): pass\n');
  write('migrations/0001.sql', 'SELECT 1;\n');
  write('lib/thing.py', 'x = 1\n');
  write('src/other.py', 'other\n');
  write('README.md', '# repo\n');
  git('add', '-A');
  git('commit', '-qm', 'init');
  const SHA = git('rev-parse', '--short', 'HEAD').trim();

  const note = (name, body) => write(`.lore/${name}`, body);

  note('tripwire-reconciler.md', `---
kind: tripwire
anchors:
  - src/billing/reconciler.py
source: PR #1
verified_sha: ${SHA}
verified_date: 2026-07-14
status: confirmed
confirmed_by: tester
---
Don't run the reconciler migration on prod without draining the queue first.
`);

  note('tripwire-migrations.md', `---
kind: tripwire
anchors:
  - migrations/
source: PR #2
verified_sha: ${SHA}
verified_date: 2026-07-14
status: confirmed
confirmed_by: tester
---
Migrations are applied in lexical order; never renumber a shipped migration.
`);

  note('tripwire-draft.md', `---
kind: tripwire
anchors:
  - src/other.py
source: PR #3
verified_sha: ${SHA}
verified_date: 2026-07-14
status: draft
---
This one is unconfirmed and must stay silent.
`);

  note('tripwire-badsha.md', `---
kind: tripwire
anchors:
  - lib/thing.py
source: PR #4
verified_sha: 0000000
verified_date: 2026-07-14
status: confirmed
confirmed_by: tester
---
Its verified_sha does not resolve, so it is always STALE.
`);

  // --- harness -------------------------------------------------------------
  // os.tmpdir() honors TMPDIR only on POSIX; Windows uses TEMP/TMP. Set all
  // three so marker isolation works everywhere.
  const runHook = (sess, rel) =>
    execFileSync(process.execPath, [HOOK], {
      input: JSON.stringify({ session_id: sess, tool_input: { file_path: path.join(REPO, ...rel.split('/')) } }),
      env: { ...process.env, CLAUDE_PROJECT_DIR: REPO, TMPDIR: SCRATCH, TEMP: SCRATCH, TMP: SCRATCH },
      encoding: 'utf8',
    });

  const isValidJson = (s) => { try { JSON.parse(s); return true; } catch { return false; } };
  // Deny-once contract: output is a block decision whose reason carries the
  // warning. blocksWith(out, re) -> true iff decision==="block" and reason matches.
  const blocksWith = (out, re) => {
    if (!out || !isValidJson(out)) return false;
    const o = JSON.parse(out);
    return o.decision === 'block' && re.test(o.reason);
  };

  // --- (a) exact-path match fires ------------------------------------------
  let out = runHook('sess-a', 'src/billing/reconciler.py');
  blocksWith(out, /TRIPWIRE for src\/billing\/reconciler\.py/)
    ? pass('(a) blocks once on exact-path match, reason carries warning')
    : fail(`(a) blocks once on exact-path match, reason carries warning [out=${out}]`);

  // --- (h) block output is valid JSON --------------------------------------
  isValidJson(out) ? pass('(h) block output is valid JSON')
                   : fail(`(h) block output is valid JSON [out=${out}]`);

  // --- (e) retry passes: second identical call produces no output ----------
  out = runHook('sess-a', 'src/billing/reconciler.py');
  out.trim() === '' ? pass('(e) retry passes silently (marker suppresses)')
                    : fail(`(e) retry passes silently (marker suppresses) [out=${out}]`);

  // --- (b) dir-prefix match fires -------------------------------------------
  out = runHook('sess-b', 'migrations/0001.sql');
  blocksWith(out, /TRIPWIRE for migrations\/0001\.sql/)
    ? pass('(b) blocks on dir-prefix match')
    : fail(`(b) blocks on dir-prefix match [out=${out}]`);

  // --- (c) non-match is silent ----------------------------------------------
  out = runHook('sess-c', 'README.md');
  out.trim() === '' ? pass('(c) silent on non-match')
                    : fail(`(c) silent on non-match [out=${out}]`);

  // --- (d) draft note is silent ----------------------------------------------
  out = runHook('sess-d', 'src/other.py');
  out.trim() === '' ? pass('(d) silent on status: draft')
                    : fail(`(d) silent on status: draft [out=${out}]`);

  // --- (f) STALE after anchor changes; re-alerts despite (e)'s marker ------
  write('src/billing/reconciler.py', 'def reconcile(): return 2\n');
  git('commit', '-qam', 'change reconciler');
  out = runHook('sess-a', 'src/billing/reconciler.py'); // same session as (a)/(e)
  blocksWith(out, /^STALE — verify before trusting:/)
    ? pass('(f) STALE prefix blocks and re-alerts across the state change')
    : fail(`(f) STALE prefix blocks and re-alerts across the state change [out=${out}]`);

  // --- (g) unresolvable verified_sha => STALE --------------------------------
  out = runHook('sess-g', 'lib/thing.py');
  blocksWith(out, /^STALE — verify before trusting:/)
    ? pass('(g) STALE when verified_sha does not resolve')
    : fail(`(g) STALE when verified_sha does not resolve [out=${out}]`);
} finally {
  // --- teardown -------------------------------------------------------------
  fs.rmSync(WORK, { recursive: true, force: true });
}

// --- result -----------------------------------------------------------------
if (fails === 0) {
  console.log('All assertions passed.');
  process.exit(0);
}
console.log(`${fails} assertion(s) failed.`);
process.exit(1);
