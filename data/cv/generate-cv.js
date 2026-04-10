const fs = require('fs');
const { marked, Renderer } = require('marked');
const path = require('path');

// Note: mangle/headerIds options removed in marked v9+; not needed with custom renderer.

function formatContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-weight-bold">$1</span>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

const renderer = new Renderer();
// Custom strong renderer
// marked v9+: receives the rendered inner HTML string, not a token object
renderer.strong = function(text) {
    return `<span style="font-weight: bold;">${text}</span>`;
};

// marked v9+: listitem receives (body, task, checked) where body is already-rendered HTML
renderer.listitem = function(text) {
    // `text` is the rendered inner HTML of the list item (not a token object)
    const str = text;

    const datePatterns = {
        yearToDate: /^(\d{4})-Date(.*)/,
        singleYear: /^(\d{4})(.*)/,
        monthYearRange: /^(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{4})\s+(.+)$/, // 9/2018-3/2021 Content
        yearRangeMonth: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s*(.*)/,           // 8-10/2017 Content
        yearRangeMonthTwo: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s*(.*)/,         // 6-8/2023 Content
        yearToYear: /^(\d{4})-(\d{4})(.*)/,
        monthYearToDate: /^(\d{1,2})\/(\d{4})-Date(.*)/,
        seasonYear: /^(Fall|Spring|Summer|Winter)\s*(\d{4}):/,
        skillsStr: /^([A-Za-z0-9\s/()&;]+):\s*(.*)/,
        monthRangeYear: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s+([^\n]+)(?:\n(.*))?/,
        monthYearToMonthYear: /^(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{4})\s*(.*)/,
        shortMonthRange: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s+(.+)$/,
    };

    // Strip <p> wrapper that marked adds around loose-list items so date
    // patterns can match regardless of whether the list is tight or loose.
    const processedStr = str.replace(/^<p>([\s\S]*?)<\/p>\n?$/, '$1').trim();
    
    // Try each pattern in order
    // Handle month/year to month/year format (e.g., 3/2020-2/2021)
    if (datePatterns.monthYearToMonthYear.test(processedStr)) {
        const [_, startMonth, startYear, endMonth, endYear, content] = processedStr.match(datePatterns.monthYearToMonthYear);
        return `<li>
            <span class="cv-year">${startMonth}/${startYear}-${endMonth}/${endYear}</span>
            <span class="cv-entry">${formatContent(content)}</span>
        </li>`;
    }

    // Handle short month range format (e.g., 6-8/2023)
    if (datePatterns.shortMonthRange.test(processedStr)) {
        const [_, startMonth, endMonth, year, content] = processedStr.match(datePatterns.shortMonthRange);
        return `<li>
            <span class="cv-year">${startMonth}-${endMonth}/${year}</span>
            <span class="cv-entry">${formatContent(content)}</span>
        </li>`;
    }

    // For year-to-year pattern
    if (datePatterns.yearToYear.test(processedStr)) {
        const [_, yearFrom, yearTo, content] = processedStr.match(datePatterns.yearToYear);
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>');
        return `<li>
            <span class="cv-year">${yearFrom}-${yearTo}</span>
            <span class="cv-entry">${formatContent(formattedContent)}</span>
        </li>`;
    }
    
    // Check for other patterns if year-to-year doesn't match
    if (datePatterns.seasonYear.test(processedStr)) {
        const [_, season, year] = processedStr.match(datePatterns.seasonYear);
        return `<li>
            <span class="cv-year-season">${season} ${year.replace(/^[ ]+|[ ]+$/g,'')}</span><span class="cv-entry-season">${processedStr.replace(/^(Fall|Spring|Summer|Winter)\s*\d{4}/, '').replace(/^[ ]+|[ ]+$/g,'').replace(':','')}</span>
        </li>`;
    }

    if (datePatterns.yearRangeMonth.test(processedStr)) {
        const [_, startMonth, endMonth, year, content] = processedStr.match(datePatterns.yearRangeMonth);
        return `<li>
            <span class="cv-year">${startMonth}-${endMonth}/${year}</span>
            <span class="cv-entry">${formatContent(content)}</span>
        </li>`;
    }

    if (datePatterns.monthYearRange.test(processedStr)) {
        const [_, startMonth, startYear, endMonth, endYear, content] = processedStr.match(datePatterns.monthYearRange);
        return `<li>
            <span class="cv-year">${startMonth}/${startYear}-${endMonth}/${endYear}</span>
            <span class="cv-entry">${formatContent(content)}</span>
        </li>`;
    }

    if (datePatterns.yearRangeMonthTwo.test(processedStr)) {
        const [_, startMonth, startYear, endMonth, endYear, content] = processedStr.match(datePatterns.yearRangeMonthTwo);
        return `<li>
            <span class="cv-year">${startMonth}/${startYear}-${endMonth}/${endYear}</span>
            <span class="cv-entry">${formatContent(content)}</span>
        </li>`;
    }

    if (datePatterns.monthYearToDate.test(processedStr)) {
        const [_, month, year, content] = processedStr.match(datePatterns.monthYearToDate);
        return `<li>
            <span class="cv-year">${month} ${year}-Date</span>
            <span class="cv-entry"><em>${formatContent(content)}</em></span>
        </li>`;
    }

    if (datePatterns.yearToDate.test(processedStr)) {
        const [_, year, content] = processedStr.match(datePatterns.yearToDate);
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>');
        return `<li>
            <span class="cv-year">${year}-Date</span>
            <span class="cv-entry">${formatContent(formattedContent)}</span>
        </li>`;
    }
    
    if (datePatterns.singleYear.test(processedStr)) {
        const [_, year, content] = processedStr.match(datePatterns.singleYear);
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>');
        return `<li>
            <span class="cv-year">${year}</span>
            <span class="cv-entry">${formatContent(formattedContent)}</span>
        </li>`;
    }

    if (datePatterns.skillsStr.test(processedStr)) {
        const [_, skillcat, skills] = processedStr.match(datePatterns.skillsStr);
        const formattedSkill = skills.replace(/LATEX/g, '<span style="font-weight: 500;">\\(\\mathsf{\\LaTeX}\\)</span>')
        return `<li>
            <span class="cv-year">${skillcat}</span>
            <span class="cv-entry">${formatContent(formattedSkill)}</span>
        </li>`;
    }

    if (datePatterns.monthRangeYear.test(processedStr)) {
        const [_, startMonth, endMonth, year, role, description] = processedStr.match(datePatterns.monthRangeYear);
        return `<li class="cv-item">
            <div class="cv-header">
                <span class="cv-year">${startMonth}-${endMonth}/${year}</span>
                <span class="cv-role">${role}</span>
            </div>
            ${description ? `<div class="cv-description">${formatContent(description)}</div>` : ''}
        </li>`;
    }
    
    // If none of the above, return the string as is
    return `<li class="cv-role-content">${processedStr}</li>`;
};

// marked v9+: heading receives (text, level, raw) where text is rendered inline HTML
renderer.heading = function (text, level, raw) {
    if (!text) {
        return '';
    }
    const cleanText = text;

    // Date patterns for depth-4 sub-headings
    const headerDatePatterns = {
        monthYearToDate: /^(\d{1,2})\/(\d{4})-Date\s+(.+)$/,
        shortMonthRange: /^(\d{1,2})-(\d{1,2})\/(\d{4})\s+(.+)$/,
        monthYearRange:  /^(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{4})\s+(.+)$/,
    };

    if (level === 4) {
        let match = cleanText.match(headerDatePatterns.shortMonthRange);
        if (match) {
            const [_, startMonth, endMonth, year, role] = match;
            return `<h4 class="subsubsection-heading">
                <span class="cv-year">${startMonth}-${endMonth}/${year}</span>
                <span class="cv-role">${role}</span>
            </h4>`;
        }

        match = cleanText.match(headerDatePatterns.monthYearRange);
        if (match) {
            const [_, startMonth, startYear, endMonth, endYear, role] = match;
            return `<h4 class="subsubsection-heading">
                <span class="cv-year">${startMonth}/${startYear}-${endMonth}/${endYear}</span>
                <span class="cv-role">${role}</span>
            </h4>`;
        }

        match = cleanText.match(headerDatePatterns.monthYearToDate);
        if (match) {
            const [_, month, year, role] = match;
            return `<h4 class="subsubsection-heading">
                <span class="cv-year">${month}/${year}-Date</span>
                <span class="cv-role">${role}</span>
            </h4>`;
        }

        return `<h4 class="subsubsection-heading">${cleanText}</h4>`;
    }

    switch (level) {
        case 1:  return `<h1 class="cv-title">${cleanText}</h1>`;
        case 2:  return `<h2 class="section-heading">${cleanText}</h2>`;
        case 3:  return `<h3 class="subsection-heading">${cleanText}</h3>`;
        default: return `<h${level}>${cleanText}</h${level}>`;
    }
};

try {
    const cvPath = path.join(__dirname, '../cv/Clinton_Enwerem_CV.md');
    const templatePath = path.join(__dirname, '../cv/cv-template.html');
    const outputPath = path.join(__dirname, '../../cv.html');

    // Read the template and markdown files
    const template = fs.readFileSync(templatePath, 'utf-8');
    const cvMarkdown = fs.readFileSync(cvPath, 'utf-8');

    // Ensure the placeholder exists in the template
    if (!template.includes('{{CV_CONTENT}}')) {
        throw new Error('Placeholder {{CV_CONTENT}} not found in the template.');
    }

    // Convert markdown to HTML
    const cvContent = marked(cvMarkdown, { renderer });

    // Replace the placeholder only
    const finalHtml = template.replace(/{{CV_CONTENT}}/g, cvContent);

    // Write the modified content to the output file
    fs.writeFileSync(outputPath, finalHtml);
    console.log('CV HTML generated successfully!');
} catch (error) {
    console.error('Error during CV generation:', error.message);
}