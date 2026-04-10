#!/usr/bin/env node
// data/scripts/sync-publications.js
//
// Extracts publication entries from research.html (the authoritative source)
// and rewrites the "### Selected Publications" block in CV.md.
//
// Usage:
//   node data/scripts/sync-publications.js
//   npm run sync
//
// Triggered automatically by the git pre-commit hook (see install-hooks.sh)
// whenever research.html is staged for commit.

'use strict';

const fs              = require('fs');
const path            = require('path');
const { parse }       = require('node-html-parser');

const ROOT  = path.resolve(__dirname, '../..');
const HTML  = path.join(ROOT, 'research.html');
const CV_MD = path.join(ROOT, 'data', 'cv', 'Clinton_Enwerem_CV.md');

// Venue badges that indicate journal publications (vs. conference / preprint)
const JOURNAL_VENUES = new Set([
  'LCSS', 'L-CSS', 'TAC', 'RA-L', 'T-RO', 'TNNLS', 'TRO',
  'TCST', 'IEEE Access', 'Automatica', 'SCL', 'IJC', 'IJRNC',
]);

// ---------------------------------------------------------------------------
// Convert a .pub-content HTML fragment to plain Markdown
// ---------------------------------------------------------------------------
function htmlToMd(html) {
  if (!html) return '';
  let s = html;

  // Preserve the bold author name as Markdown **bold**
  s = s.replace(
    /<span\b[^>]*font-weight\s*:\s*bold[^>]*>([\s\S]*?)<\/span>/gi,
    '**$1**',
  );

  // Keep ordinal superscript text ("th", "rd", etc.) but drop the tag
  s = s.replace(/<sup>([\s\S]*?)<\/sup>/gi, '$1');

  // Convert <a href="...">text</a> to Markdown [text](url)
  s = s.replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Strip all remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  const ENTITIES = {
    '&ldquo;': '\u201C', '&rdquo;': '\u201D',
    '&lsquo;': '\u2018', '&rsquo;': '\u2019',
    '&amp;':   '&',      '&nbsp;':  ' ',
    '&lt;':    '<',      '&gt;':    '>',
    '&ndash;': '\u2013', '&mdash;': '\u2014',
    '&#8211;': '\u2013', '&#8212;': '\u2014',
  };
  for (const [ent, ch] of Object.entries(ENTITIES)) {
    s = s.split(ent).join(ch);
  }
  // Numeric (decimal and hex) entities
  s = s.replace(/&#(\d+);/g,     (_, n) => String.fromCharCode(+n));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // Collapse whitespace
  return s.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Walk the DOM in document order, tracking category and year with a state
// machine.  Populates `entries` with every .pub-main-row it finds.
// ---------------------------------------------------------------------------
function extractEntries(html) {
  const root    = parse(html);
  const entries = [];
  let category  = '';
  let year      = '';

  function walk(node) {
    // Only process element nodes (nodeType 1); skip text/comment nodes
    if (node.nodeType !== 1) return;
    const name = node.tagName.toLowerCase();

    // <heading> sets the section category (peer-reviewed / under review / …)
    if (name === 'heading') {
      category = node.querySelector('span')?.text.trim() ?? '';
      return;
    }

    // <span class="project-section">2025</span> — only treat 4-digit years
    if (name === 'span' && node.classList.contains('project-section')) {
      const t = node.text.trim();
      if (/^\d{4}$/.test(t)) year = t;
      return;
    }

    // .pub-main-row — this is an individual paper entry
    if (name === 'div' && node.classList.contains('pub-main-row')) {
      const badge       = node.querySelector('.venue-badge')?.text.trim() ?? '';
      const contentHtml = node.querySelector('.pub-content')?.innerHTML ?? '';
      entries.push({ year, category, venue: badge, text: htmlToMd(contentHtml) });
      return; // do not descend further inside a pub entry
    }

    // Recurse into everything else
    for (const child of node.childNodes) {
      walk(child);
    }
  }

  // Scope the walk to the <td> containing the "Publications" sub-heading so
  // we don't pick up project-section spans from other parts of the page.
  const allSubHeadings = root.querySelectorAll('span.sub-heading');
  const pubLabel = allSubHeadings.find(el => el.text.trim() === 'Publications');
  let containerTd = pubLabel;
  while (containerTd && containerTd.tagName?.toLowerCase() !== 'td') {
    containerTd = containerTd.parentNode;
  }
  const startNode = containerTd ?? root;

  for (const child of startNode.childNodes) {
    walk(child);
  }

  if (!entries.length) {
    throw new Error('No publication entries found — check the DOM structure of research.html.');
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Extract <!-- cv-only --> entries from the existing CV.md publications block
// so they survive the sync (these are entries not sourced from research.html).
// ---------------------------------------------------------------------------
function extractCvOnlyFromCvMd() {
  const result = { preprints: [], confs: [], journals: [] };
  let src;
  try { src = fs.readFileSync(CV_MD, 'utf8'); } catch { return result; }

  const start = src.indexOf('### Selected Publications');
  if (start === -1) return result;

  const after = src.indexOf('\n### ', start + 1);
  const block = after !== -1 ? src.slice(start, after) : src.slice(start);

  let section = '';
  const lines = block.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Preprints/Articles In Review'))    section = 'preprints';
    else if (lines[i].includes('In Conference Proceedings'))  section = 'confs';
    else if (lines[i].includes('Journal Articles'))           section = 'journals';
    else if (lines[i].includes('<!-- cv-only -->') && section) {
      const clean = lines[i].replace(/\s*<!-- cv-only -->\s*/, '').trim();
      if (clean) result[section].push(clean);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Render a sorted list of entries as Markdown list items, newest first.
// Optionally merges in cv-only entries (preserved across syncs).
// ---------------------------------------------------------------------------
function renderList(arr, cvOnlyEntries) {
  const htmlItems = [...arr].sort((a, b) => +b.year - +a.year)
    .map(e => ({ year: +e.year, text: `- ${e.year} ${e.text}` }));

  const cvItems = (cvOnlyEntries || []).map(text => {
    const m = text.match(/^- (\d{4})/);
    return { year: m ? +m[1] : 0, text: `${text} <!-- cv-only -->` };
  });

  const all = [...htmlItems, ...cvItems].sort((a, b) => b.year - a.year);
  if (!all.length) return '';
  return all.map(e => e.text).join('\n\n');
}

// ---------------------------------------------------------------------------
// Build the complete ### Selected Publications block
// ---------------------------------------------------------------------------
function renderPubBlock(entries, cvOnly) {
  const preprints = [];
  const confs     = [];
  const journals  = [];

  for (const e of entries) {
    const cat = e.category.toLowerCase();
    if ((cat.includes('review') && !cat.includes('peer')) || cat.includes('preprint') || cat.includes('report')) {
      preprints.push(e);
    } else if (JOURNAL_VENUES.has(e.venue)) {
      journals.push(e);
    } else {
      confs.push(e);
    }
  }

  const sections = [
    '### Selected Publications',
    '',
    '#### Preprints/Articles In Review',
    '',
    renderList(preprints, cvOnly.preprints),
    '',
    '#### In Conference Proceedings',
    '',
    renderList(confs, cvOnly.confs),
    '',
    '#### Journal Articles',
    '',
    renderList(journals, cvOnly.journals),
    '',
  ];

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Splice the regenerated block into CV.md, replacing the old one in place
// ---------------------------------------------------------------------------
function updateCvMd(newBlock) {
  const src   = fs.readFileSync(CV_MD, 'utf8');
  const start = src.indexOf('### Selected Publications');
  if (start === -1) {
    throw new Error('"### Selected Publications" marker not found in CV.md');
  }

  // Find the next top-level ### heading after the publications section
  const after = src.indexOf('\n### ', start + 1);
  const tail  = after !== -1 ? src.slice(after) : '';
  const head  = src.slice(0, start);

  const updated = head + newBlock + tail;
  if (updated === src) {
    console.log('sync-publications: CV.md is already up-to-date.');
    return false;
  }

  fs.writeFileSync(CV_MD, updated, 'utf8');
  console.log('sync-publications: CV.md publications section updated.');
  return true;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
try {
  const html    = fs.readFileSync(HTML, 'utf8');
  const entries = extractEntries(html);
  const cvOnly  = extractCvOnlyFromCvMd();
  const block   = renderPubBlock(entries, cvOnly);
  updateCvMd(block);
} catch (err) {
  console.error('sync-publications error:', err.message);
  process.exit(1);
}
