#!/usr/bin/env bash
# lore tripwire hook (PreToolUse: Edit|Write|MultiEdit).
# Non-blocking: always permits the edit; only emits a systemMessage when the
# edited file is guarded by a confirmed lore tripwire. A broken hook is worse
# than no warning, so every failure path exits 0 silently.
set -u
shopt -s nullglob

# jq is the only hard dependency. Missing -> stay silent.
command -v jq >/dev/null 2>&1 || exit 0

dir="${CLAUDE_PROJECT_DIR:-}"
[ -n "$dir" ] || exit 0
[ -d "$dir/.lore" ] || exit 0

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
sid=$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null) || exit 0
[ -n "$file" ] || exit 0

# Relativize; never warn on edits to the notes themselves.
rel=${file#"$dir"/}
case "$rel" in
  .lore/*) exit 0 ;;
esac

# awk helpers over a note's YAML frontmatter (between the first two --- lines).
fm_field() { # file, key -> value (first match, CR/space trimmed)
  awk -v k="$2" '
    /^---[[:space:]]*$/ { c++; next }
    c==1 {
      line=$0; sub(/\r$/,"",line)
      if (line ~ "^" k ":") {
        v=line; sub("^" k ":[[:space:]]*","",v); sub(/[[:space:]]+$/,"",v)
        print v; exit
      }
    }
  ' "$1"
}
fm_anchors() { # file -> one anchor per line
  awk '
    /^---[[:space:]]*$/ { c++; next }
    c!=1 { next }
    /^anchors:/ { ina=1; next }
    ina && /^[[:space:]]*-[[:space:]]/ {
      a=$0; sub(/\r$/,"",a); sub(/^[[:space:]]*-[[:space:]]*/,"",a); sub(/[[:space:]]+$/,"",a)
      if (a!="") print a; next
    }
    ina && /^[^[:space:]]/ { ina=0 }
  ' "$1"
}
fm_body() { # file -> note body (everything after the second ---)
  awk '/^---[[:space:]]*$/ { c++; next } c>=2 { print }' "$1"
}

# Per-user marker dir: predictable names in shared /tmp are pre-createable /
# symlinkable by other users. mkdir failure -> silent exit (broken hook rule).
tmp="${TMPDIR:-/tmp}/lore-$(id -u)"
mkdir -p -m 700 "$tmp" 2>/dev/null || exit 0
messages=""

for f in "$dir"/.lore/tripwire-*.md; do
  [ -f "$f" ] || continue
  [ "$(fm_field "$f" status)" = "confirmed" ] || continue

  anchors=$(fm_anchors "$f")
  matched=0
  fileanchors=()
  while IFS= read -r anchor; do
    [ -n "$anchor" ] || continue
    case "$anchor" in
      */) ;;                       # directory anchor: informational only
      *)  fileanchors+=("$anchor") ;;
    esac
    [ "$rel" = "$anchor" ] && matched=1
    case "$anchor" in
      */) case "$rel" in "$anchor"*) matched=1 ;; esac ;;
    esac
  done <<< "$anchors"
  [ "$matched" -eq 1 ] || continue

  # Staleness (computed BEFORE dedupe: it is part of the dedupe key).
  # Unreachable verified_sha => STALE, never fresh.
  sha=$(fm_field "$f" verified_sha)
  stale=0
  if [ -z "$sha" ] || ! git -C "$dir" cat-file -e "${sha}^{commit}" 2>/dev/null; then
    stale=1
  elif [ "${#fileanchors[@]}" -gt 0 ]; then
    changed=$(git -C "$dir" diff --name-only "${sha}..HEAD" -- "${fileanchors[@]}" 2>/dev/null)
    [ -n "$changed" ] && stale=1
  fi
  if [ "$stale" -eq 1 ]; then state="stale"; else state="fresh"; fi

  # Dedupe: one warning per note per state per session. basename because the
  # raw note path contains '/'. A fresh->stale transition re-alerts once.
  marker="$tmp/lore-${sid}-$(basename "$f")-${state}"
  [ -e "$marker" ] && continue
  : > "$marker" 2>/dev/null || true

  notefile=${f#"$dir"/}
  who=$(fm_field "$f" confirmed_by)
  when=$(fm_field "$f" verified_date)
  body=$(fm_body "$f")

  msg="TRIPWIRE for $rel ($notefile, confirmed by $who on $when): $body"
  [ "$stale" -eq 1 ] && msg="STALE — verify before trusting: $msg"

  if [ -z "$messages" ]; then messages="$msg"; else messages="$messages"$'\n\n'"$msg"; fi
done

[ -n "$messages" ] || exit 0

jq -cn --arg msg "$messages" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"allow"},systemMessage:$msg}'
exit 0
