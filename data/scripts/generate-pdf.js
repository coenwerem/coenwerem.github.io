// generate-pdf.js — uses Puppeteer to render cv.html and resume.html to PDF.
// Run from repo root: node data/scripts/generate-pdf.js
//
// Prerequisites:
//   npm install puppeteer-core
//
// Chrome path: defaults to /usr/bin/google-chrome.
// Override via:  CHROME_PATH=/path/to/chrome node data/scripts/generate-pdf.js

const puppeteer = require('puppeteer-core');

const DEFAULT_CHROME = '/usr/bin/google-chrome';
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '../../');

// Documents to generate: { sourceHtml, outputPdf }
const DOCS = [
    {
        sourceHtml: path.join(REPO_ROOT, 'cv.html'),
        outputPdf:  path.join(REPO_ROOT, 'data/cv/Clinton_Enwerem_CV.pdf'),
    },
    {
        sourceHtml: path.join(REPO_ROOT, 'resume.html'),
        outputPdf:  path.join(REPO_ROOT, 'data/resume/Clinton_Enwerem_Resume.pdf'),
    },
];

async function generatePdf(browser, sourceHtml, outputPdf) {
    if (!fs.existsSync(sourceHtml)) {
        console.warn(`  Skipping — source not found: ${sourceHtml}`);
        return;
    }

    const page = await browser.newPage();

    // Force light mode so the PDF always uses the light-mode palette.
    await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'light' },
    ]);

    const fileUrl = `file://${sourceHtml}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Briefly expose print media so @media print rules apply.
    await page.emulateMediaType('print');

    // Use a small delay to allow any JS-driven rendering to settle.
    await new Promise(r => setTimeout(r, 500));

    await page.pdf({
        path: outputPdf,
        format: 'A4',
        printBackground: false,   // @media print already zeroes backgrounds
        margin: { top: '20mm', right: '30mm', bottom: '20mm', left: '30mm' },
        displayHeaderFooter: false,
        preferCSSPageSize: false,
        scale: 1,
    });

    await page.close();
    console.log(`  ✓ ${path.relative(REPO_ROOT, outputPdf)}`);
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_PATH || DEFAULT_CHROME,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Generating PDFs…');

    for (const { sourceHtml, outputPdf } of DOCS) {
        await generatePdf(browser, sourceHtml, outputPdf);
    }

    await browser.close();
    console.log('Done.');
})().catch(err => {
    console.error('PDF generation failed:', err.message);
    process.exit(1);
});
