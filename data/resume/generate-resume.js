// generate-resume.js — converts data/resume/Clinton_Enwerem_Resume.md
//   + data/resume/resume-template.html  →  resume.html at repo root.
// Run from repo root: node data/resume/generate-resume.js

const fs = require('fs');
const { marked, Renderer } = require('marked');
const path = require('path');

marked.use({ mangle: false, headerIds: false });

// ── helpers ────────────────────────────────────────────────────────────────────

function formatContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight:bold;">$1</span>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// ── custom renderer ─────────────────────────────────────────────────────────────
// Note: marked v9+ passes plain strings to renderer functions, not token objects.
// heading(text, level, raw), strong(text), listitem(body, task, checked)

const renderer = new Renderer();

renderer.strong = function (text) {
    return `<span style="font-weight: bold;">${text}</span>`;
};

renderer.listitem = function (text) {
    // marked v9+ wraps loose-list items in <p>…</p>; strip the wrapper
    const str = text.replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1');

    const patterns = {
        monthYearToMonthYear: /^(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{4})\s*(.*)/,
        shortMonthRange:      /^(\d{1,2})-(\d{1,2})\/(\d{4})\s+(.+)$/,
        yearToYear:           /^(\d{4})-(\d{4})(.*)/,
        seasonYear:           /^(Fall|Spring|Summer)\s*(\d{4}):/,
        skillsStr:            /^([A-Za-z0-9\s/()]+):\s*(.*)/,
        yearToDate:           /^(\d{4})-Date(.*)/,
        singleYear:           /^(\d{4})(.*)/,
    };

    let m;

    if ((m = str.match(patterns.monthYearToMonthYear))) {
        const [, sm, sy, em, ey, content] = m;
        return `<li><span class="cv-year">${sm}/${sy}-${em}/${ey}</span><span class="cv-entry">${formatContent(content)}</span></li>`;
    }
    if ((m = str.match(patterns.shortMonthRange))) {
        const [, sm, em, y, content] = m;
        return `<li><span class="cv-year">${sm}-${em}/${y}</span><span class="cv-entry">${formatContent(content)}</span></li>`;
    }
    if ((m = str.match(patterns.yearToYear))) {
        const [, yf, yt, content] = m;
        return `<li><span class="cv-year">${yf}-${yt}</span><span class="cv-entry">${formatContent(content)}</span></li>`;
    }
    if ((m = str.match(patterns.seasonYear))) {
        const [, season, year] = m;
        const rest = str.replace(/^(Fall|Spring|Summer)\s*\d{4}/, '').replace(/^[: ]+/, '');
        return `<li><span class="cv-year-season">${season} ${year}</span><span class="cv-entry-season">${rest}</span></li>`;
    }
    if ((m = str.match(patterns.skillsStr))) {
        const [, cat, skills] = m;
        return `<li><span class="cv-year">${cat}</span><span class="cv-entry">${formatContent(skills)}</span></li>`;
    }
    if ((m = str.match(patterns.yearToDate))) {
        const [, year, content] = m;
        return `<li><span class="cv-year">${year}-Date</span><span class="cv-entry">${formatContent(content)}</span></li>`;
    }
    if ((m = str.match(patterns.singleYear))) {
        const [, year, content] = m;
        return `<li><span class="cv-year">${year}</span><span class="cv-entry">${formatContent(content)}</span></li>`;
    }

    return `<li class="cv-role-content">${str}</li>`;
};

renderer.heading = function (text, level, raw) {
    if (!text) return '';
    const clean = text;  // rendered inline HTML string in marked v9+

    const headerPatterns = {
        monthYearToDate: /^(\d{1,2})\/(\d{4})-Date\s+(.+)$/,
        shortMonthRange: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s+(.+)$/,
        monthYearRange:  /^(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{4})\s+(.+)$/,
    };

    if (level === 4) {
        let m;
        if ((m = clean.match(headerPatterns.shortMonthRange))) {
            const [, sm, em, y, role] = m;
            return `<h4 class="subsubsection-heading"><span class="cv-year">${sm}-${em}/${y}</span><span class="cv-role">${role}</span></h4>`;
        }
        if ((m = clean.match(headerPatterns.monthYearRange))) {
            const [, sm, sy, em, ey, role] = m;
            return `<h4 class="subsubsection-heading"><span class="cv-year">${sm}/${sy}-${em}/${ey}</span><span class="cv-role">${role}</span></h4>`;
        }
        if ((m = clean.match(headerPatterns.monthYearToDate))) {
            const [, month, year, role] = m;
            return `<h4 class="subsubsection-heading"><span class="cv-year">${month}/${year}-Date</span><span class="cv-role">${role}</span></h4>`;
        }
        return `<h4 class="subsubsection-heading">${clean}</h4>`;
    }

    switch (level) {
        case 1: return `<h1 class="cv-title">${clean}</h1>`;
        case 2: return `<h2 class="section-heading">${clean}</h2>`;
        case 3: return `<h3 class="subsection-heading">${clean}</h3>`;
        default: return `<h${level}>${clean}</h${level}>`;
    }
};

// ── main ────────────────────────────────────────────────────────────────────────

try {
    const resumeMd   = path.join(__dirname, 'Clinton_Enwerem_Resume.md');
    const templateHtml = path.join(__dirname, 'resume-template.html');
    const outputHtml = path.join(__dirname, '../../resume.html');

    const template = fs.readFileSync(templateHtml, 'utf-8');
    const markdown = fs.readFileSync(resumeMd, 'utf-8');

    if (!template.includes('{{RESUME_CONTENT}}')) {
        throw new Error('Placeholder {{RESUME_CONTENT}} not found in resume-template.html.');
    }

    const body = marked(markdown, { renderer });
    const html = template.replace(/{{RESUME_CONTENT}}/g, body);

    fs.writeFileSync(outputHtml, html, 'utf-8');
    console.log('Résumé HTML generated → resume.html');
} catch (err) {
    console.error('Error generating résumé HTML:', err.message);
    process.exit(1);
}
