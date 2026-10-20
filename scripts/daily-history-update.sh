#!/bin/zsh

set -euo pipefail

repo_dir="/Users/sakshisingh/Desktop/Frontend/react_js/LibararyManagment"
cd "$repo_dir"

target_date="${1:-$(date '+%Y-%m-%d')}"
update_date="$(date -j -f '%Y-%m-%d' "$target_date" '+%B %-d')"
update_line="// Update on $update_date"

if grep -Fxq "$update_line" history.txt; then
  exit 0
fi

printf '%s\n' "$update_line" >> history.txt
git add -f history.txt

commit_timestamp="$(date -j -f '%Y-%m-%d' "$target_date" '+%Y-%m-%dT12:00:00%z')"
GIT_AUTHOR_DATE="$commit_timestamp" \
GIT_COMMITTER_DATE="$commit_timestamp" \
git commit -m "Update for $update_date"
git push origin main
