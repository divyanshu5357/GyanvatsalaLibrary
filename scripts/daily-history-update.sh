#!/bin/zsh

set -euo pipefail

repo_dir="/Users/sakshisingh/Desktop/Frontend/react_js/LibararyManagment"
cd "$repo_dir"

# Pull latest remote commits to prevent conflicts with GitHub Actions
git pull --rebase origin main

target_date="${1:-$(date '+%Y-%m-%d')}"
update_date="$(date -j -f '%Y-%m-%d' "$target_date" '+%B %-d')"
update_line="// Update on $update_date"

# Check if entry already exists to prevent duplicate entries
if grep -Fxq "$update_line" history.txt; then
  echo "Entry '$update_line' already exists in history.txt. Nothing to do."
  exit 0
fi

# Ensure trailing newline before appending
if [ -s history.txt ] && [ "$(tail -c 1 history.txt)" != "" ]; then
  echo "" >> history.txt
fi

printf '%s\n' "$update_line" >> history.txt

# Stage ONLY history.txt
git add history.txt

if git diff --staged --quiet; then
  echo "No changes staged. Nothing to commit."
  exit 0
fi

git commit -m "Update for $update_date"

git push origin main
echo "Successfully pushed update for $update_date"
