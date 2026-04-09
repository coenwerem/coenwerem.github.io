#!/usr/bin/env bash
# install-hooks.sh — wire up the git pre-commit hook for this repo.
#
# The hook automatically runs sync-publications.js whenever research.html
# is staged, then re-stages the updated CV.md so both land in the same commit.
#
# Usage (run once after cloning or after npm install):
#   bash install-hooks.sh

set -euo pipefail

HOOK=".git/hooks/pre-commit"

cat > "$HOOK" << 'HOOK_BODY'
#!/bin/sh
# Pre-commit hook: sync CV.md publications from research.html when the latter
# is among the staged files.
if git diff --cached --name-only | grep -q 'research\.html'; then
  printf "→ research.html staged — syncing publications to CV.md…\n"
  node data/scripts/sync-publications.js || {
    printf "sync-publications failed — commit aborted.\n"
    exit 1
  }
  git add data/cv/Clinton_Enwerem_CV.md
fi
HOOK_BODY

chmod +x "$HOOK"
echo "Pre-commit hook installed at $HOOK"
