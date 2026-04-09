#!/usr/bin/env bash
# build.sh — rebuild CV, résumé HTML and PDFs from Markdown sources.
#
# Usage:
#   ./build.sh           # sync + HTML + PDFs
#   ./build.sh --html    # sync + HTML only (no PDF, no Puppeteer required)
#
# First-time setup:
#   npm install
#   bash install-hooks.sh   # wires the git pre-commit hook

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

HTML_ONLY=false
if [[ "${1:-}" == "--html" ]]; then
    HTML_ONLY=true
fi

echo "==> Syncing publications from research.html → CV.md…"
node data/scripts/sync-publications.js

echo "==> Generating CV HTML…"
node data/cv/generate-cv.js

echo "==> Generating résumé HTML…"
node data/resume/generate-resume.js

if [[ "$HTML_ONLY" == "true" ]]; then
    echo "==> Skipping PDF generation (--html flag set)."
else
    echo "==> Generating PDFs (requires puppeteer)…"
    node data/scripts/generate-pdf.js
fi

echo ""
echo "Build complete."
echo "  cv.html       → $(ls -lh cv.html | awk '{print $5}')"
echo "  resume.html   → $(ls -lh resume.html 2>/dev/null | awk '{print $5}' || echo 'not found')"
if [[ "$HTML_ONLY" == "false" ]]; then
    echo "  CV PDF        → $(ls -lh data/cv/Clinton_Enwerem_CV.pdf 2>/dev/null | awk '{print $5}' || echo 'not found')"
    echo "  Résumé PDF    → $(ls -lh data/resume/Clinton_Enwerem_Resume.pdf 2>/dev/null | awk '{print $5}' || echo 'not found')"
fi
