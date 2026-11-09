#!/usr/bin/env bash
# Fail when files of an existing app changed since <base-ref> without a tipi_version bump.
# apps/<id>/CLAUDE.md is agent documentation, not shipped to Runtipi: it needs no bump.
set -euo pipefail
base=${1:?usage: scripts/check-tipi-version.sh <base-ref>}

fail=0
apps=$(git diff --name-only "$base"...HEAD -- apps/ |
  grep -E '^apps/[^/]+/' | grep -vE '^apps/(__tests__/|[^/]+/CLAUDE\.md$)' |
  cut -d/ -f2 | sort -u || true)

for app in $apps; do
  config="apps/$app/config.json"
  [ -f "$config" ] || continue                               # app removed
  git cat-file -e "$base:$config" 2>/dev/null || continue    # new app
  old=$(git show "$base:$config" | jq .tipi_version)
  new=$(jq .tipi_version "$config")
  if [ "$new" -le "$old" ]; then
    echo "::error file=$config::$app changed but tipi_version is $new (base $base has $old): bump it and set updated_at"
    fail=1
  fi
done
exit $fail
