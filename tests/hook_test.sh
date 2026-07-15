#!/usr/bin/env bash
# Unit test for hooks/tripwire.js. Builds a temp git repo fixture with a
# scratch TMPDIR, exercises asserts (a)-(g), tears down. Non-zero exit on any
# failure. Self-contained: pass on repeat runs (markers live in the scratch
# TMPDIR, wiped at setup).
set -u

HOOK="$(cd "$(dirname "$0")/.." && pwd)/hooks/tripwire.js"
FAILS=0

pass() { printf 'ok   - %s\n' "$1"; }
fail() { printf 'FAIL - %s\n' "$1"; FAILS=$((FAILS + 1)); }

# --- setup: temp git repo + scratch TMPDIR ---------------------------------
WORK=$(mktemp -d)
REPO="$WORK/repo"
export TMPDIR="$WORK/tmp"
mkdir -p "$REPO" "$TMPDIR"

teardown() { rm -rf "$WORK"; }
trap teardown EXIT

git -C "$REPO" init -q
git -C "$REPO" config user.email tester@example.com
git -C "$REPO" config user.name Tester

mkdir -p "$REPO/src/billing" "$REPO/migrations" "$REPO/lib" "$REPO/.lore"
printf 'def reconcile(): pass\n' > "$REPO/src/billing/reconciler.py"
printf 'SELECT 1;\n'            > "$REPO/migrations/0001.sql"
printf 'x = 1\n'               > "$REPO/lib/thing.py"
printf 'other\n'               > "$REPO/src/other.py"
printf '# repo\n'              > "$REPO/README.md"
git -C "$REPO" add -A
git -C "$REPO" commit -qm init
SHA=$(git -C "$REPO" rev-parse --short HEAD)

note() { # file, contents-heredoc via stdin
  cat > "$REPO/.lore/$1"
}

note tripwire-reconciler.md <<EOF
---
kind: tripwire
anchors:
  - src/billing/reconciler.py
source: PR #1
verified_sha: $SHA
verified_date: 2026-07-14
status: confirmed
confirmed_by: tester
---
Don't run the reconciler migration on prod without draining the queue first.
EOF

note tripwire-migrations.md <<EOF
---
kind: tripwire
anchors:
  - migrations/
source: PR #2
verified_sha: $SHA
verified_date: 2026-07-14
status: confirmed
confirmed_by: tester
---
Migrations are applied in lexical order; never renumber a shipped migration.
EOF

note tripwire-draft.md <<EOF
---
kind: tripwire
anchors:
  - src/other.py
source: PR #3
verified_sha: $SHA
verified_date: 2026-07-14
status: draft
---
This one is unconfirmed and must stay silent.
EOF

note tripwire-badsha.md <<EOF
---
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
EOF

# --- harness ---------------------------------------------------------------
run_hook() { # session, relpath -> stdout of hook
  local sess="$1" rel="$2" json
  json=$(jq -cn --arg s "$sess" --arg f "$REPO/$rel" \
    '{session_id:$s, tool_input:{file_path:$f}}')
  CLAUDE_PROJECT_DIR="$REPO" printf '%s' "$json" | CLAUDE_PROJECT_DIR="$REPO" node "$HOOK"
}

is_valid_json() { printf '%s' "$1" | jq . >/dev/null 2>&1; }
# Deny-once contract: output is a block decision whose reason carries the
# warning. blocks_with OUT REGEX -> true iff decision=="block" and reason
# matches.
blocks_with() {
  [ -n "$1" ] && is_valid_json "$1" && \
    printf '%s' "$1" | jq -e --arg re "$2" \
      '.decision == "block" and (.reason | test($re))' >/dev/null
}

# --- (a) exact-path match fires --------------------------------------------
out=$(run_hook sess-a src/billing/reconciler.py)
blocks_with "$out" 'TRIPWIRE for src/billing/reconciler.py' \
  && pass "(a) blocks once on exact-path match, reason carries warning" \
  || fail "(a) blocks once on exact-path match, reason carries warning [out=$out]"

# --- (h) block output is valid JSON ----------------------------------------
is_valid_json "$out" && pass "(h) block output is valid JSON" \
                     || fail "(h) block output is valid JSON [out=$out]"

# --- (e) retry passes: second identical call produces no output -------------
out=$(run_hook sess-a src/billing/reconciler.py)
[ -z "$out" ] && pass "(e) retry passes silently (marker suppresses)" \
              || fail "(e) retry passes silently (marker suppresses) [out=$out]"

# --- (b) dir-prefix match fires --------------------------------------------
out=$(run_hook sess-b migrations/0001.sql)
blocks_with "$out" 'TRIPWIRE for migrations/0001.sql' \
  && pass "(b) blocks on dir-prefix match" \
  || fail "(b) blocks on dir-prefix match [out=$out]"

# --- (c) non-match is silent -----------------------------------------------
out=$(run_hook sess-c README.md)
[ -z "$out" ] && pass "(c) silent on non-match" \
              || fail "(c) silent on non-match [out=$out]"

# --- (d) draft note is silent ----------------------------------------------
out=$(run_hook sess-d src/other.py)
[ -z "$out" ] && pass "(d) silent on status: draft" \
              || fail "(d) silent on status: draft [out=$out]"

# --- (f) STALE after anchor changes; re-alerts despite (e)'s marker --------
printf 'def reconcile(): return 2\n' > "$REPO/src/billing/reconciler.py"
git -C "$REPO" commit -qam "change reconciler"
out=$(run_hook sess-a src/billing/reconciler.py)   # same session as (a)/(e)
blocks_with "$out" '^STALE — verify before trusting:' \
  && pass "(f) STALE prefix blocks and re-alerts across the state change" \
  || fail "(f) STALE prefix blocks and re-alerts across the state change [out=$out]"

# --- (g) unresolvable verified_sha => STALE --------------------------------
out=$(run_hook sess-g lib/thing.py)
blocks_with "$out" '^STALE — verify before trusting:' \
  && pass "(g) STALE when verified_sha does not resolve" \
  || fail "(g) STALE when verified_sha does not resolve [out=$out]"

# --- result ----------------------------------------------------------------
if [ "$FAILS" -eq 0 ]; then
  echo "All assertions passed."
  exit 0
fi
echo "$FAILS assertion(s) failed."
exit 1
