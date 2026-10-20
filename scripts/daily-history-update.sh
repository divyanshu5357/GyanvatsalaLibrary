#!/bin/zsh

set -euo pipefail

repo_dir="/Users/sakshisingh/Desktop/Frontend/react_js/LibararyManagment"
cd "$repo_dir"

update_date="$(date '+%B %-d')"
update_line="// Update on $update_date"

if grep -Fxq "$update_line" history.txt; then
  exit 0
fi

printf '%s\n' "$update_line" >> history.txt
git add -f history.txt

commit_timestamp="$(date '+%Y-%m-%dT%H:%M:%S%z')"
GIT_AUTHOR_DATE="$commit_timestamp" \
GIT_COMMITTER_DATE="$commit_timestamp" \
git commit -m "Update for $update_date"
git push origin main
