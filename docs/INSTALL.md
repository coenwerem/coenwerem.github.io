# 1. Install Node.js
sudo apt install nodejs npm

# 2. Alternatively, you can use nvm for a version-managed install:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# 3. Install project deps (puppeteer-core is ~3MB, no bundled browser)
cd ~/WebP/coenwerem.github.io
npm install

# 4. Run the full pipeline
./build.sh              # generates cv.html, resume.html, and both PDFs

# Or just HTML (no Chrome headless required):
./build.sh --html

## Hooks

- **sync-publications.js** — walks the research.html DOM in document order with a simple state machine (tracks current category/year as it descends), extracts every `.pub-main-row`, converts the HTML to Markdown (bold author, decoded entities) and rewrites the `### Selected Publications` block in `CV.md`. Uses `node-html-parser` (Node 18-compatible, no `undici`).

- **install-hooks.sh**; must be run once to wire up the git pre-commit hook:
```bash
bash install-hooks.sh
```

**Workflow:**
1. Edit research.html to add a new publication
2. `git add research.html` 
3. `git commit` — the hook fires automatically, runs the sync, and `git add`s the updated `CV.md` into the same commit. 

To trigger the sync manually:
```bash
node data/scripts/sync-publications.js   # npm run sync also works
./build.sh                               # always syncs first now
```