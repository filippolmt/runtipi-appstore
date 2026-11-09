#!/usr/bin/env bash
# Fail when files of an existing app changed since <base-ref> without a tipi_version bump
# and a newer updated_at. apps/<id>/CLAUDE.md is agent documentation, not shipped to
# Runtipi: it is the one exemption (single source of truth for the rule's scope).
set -euo pipefail
base=${1:?usage: scripts/check-tipi-version.sh <base-ref>}
git rev-parse --verify --quiet "$base^{commit}" >/dev/null || {
  echo "::error::base ref '$base' not found (fetch it, or pass e.g. origin/main)"
  exit 2
}

changed=$(git diff --name-only "$base"...HEAD -- apps/)
apps=$(printf '%s\n' "$changed" | grep -E '^apps/[^/]+/' |
  grep -vE '^apps/(__tests__/|[^/]+/CLAUDE\.md$)' | cut -d/ -f2 | sort -u || true)

# jq -e fails on a missing/non-numeric field instead of printing null.
field() { jq -e ".$1 | numbers" || { echo "::error::$app: $1 missing or not a number" >&2; return 1; }; }

fail=0
while IFS= read -r app; do
  [ -n "$app" ] || continue
  config="apps/$app/config.json"
  [ -f "$config" ] || continue                               # app removed
  git cat-file -e "$base:$config" 2>/dev/null || continue    # new app
  old_v=$(git show "$base:$config" | field tipi_version) || { fail=1; continue; }
  new_v=$(field tipi_version <"$config") || { fail=1; continue; }
  old_u=$(git show "$base:$config" | field updated_at) || { fail=1; continue; }
  new_u=$(field updated_at <"$config") || { fail=1; continue; }
  if [ "$new_v" -le "$old_v" ] || [ "$new_u" -le "$old_u" ]; then
    echo "::error file=$config::$app changed: tipi_version $old_v -> $new_v, updated_at $old_u -> $new_u; bump tipi_version and set updated_at to Date.now()"
    fail=1
  fi
done <<<"$apps"
exit $fail
