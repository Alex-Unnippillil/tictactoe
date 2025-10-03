const fs = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');

const COVERAGE_SUMMARY_PATH = path.resolve(__dirname, '../coverage/coverage-summary.json');
const BADGE_DIR = path.resolve(__dirname, '../badges');
const BADGE_PATH = path.join(BADGE_DIR, 'coverage.svg');
const README_PATH = path.resolve(__dirname, '../README.md');
const TABLE_START = '<!-- COVERAGE-TABLE:START -->';
const TABLE_END = '<!-- COVERAGE-TABLE:END -->';

function readCoverageSummary() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    throw new Error('Coverage summary not found. Run the coverage command first.');
  }

  const raw = fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8');
  return JSON.parse(raw).total;
}

function formatPercentage(value) {
  return `${value.toFixed(2)}%`;
}

function coverageColor(pct) {
  if (pct >= 95) return 'brightgreen';
  if (pct >= 90) return 'green';
  if (pct >= 80) return 'yellow';
  if (pct >= 70) return 'orange';
  return 'red';
}

function ensureBadgeDirectory() {
  if (!fs.existsSync(BADGE_DIR)) {
    fs.mkdirSync(BADGE_DIR, { recursive: true });
  }
}

function writeBadge(linesPct) {
  ensureBadgeDirectory();
  const badgeSVG = makeBadge({
    label: 'coverage',
    message: `${linesPct.toFixed(0)}%`,
    color: coverageColor(linesPct),
    labelColor: '#555',
    style: 'flat'
  });

  fs.writeFileSync(BADGE_PATH, badgeSVG);
}

function buildCoverageTable(total) {
  const metrics = [
    { key: 'statements', label: 'Statements' },
    { key: 'branches', label: 'Branches' },
    { key: 'functions', label: 'Functions' },
    { key: 'lines', label: 'Lines' }
  ];

  const rows = metrics.map(({ key, label }) => `| ${label} | ${formatPercentage(total[key].pct)} |`);

  return ['| Metric | Coverage |', '| --- | --- |', ...rows].join('\n');
}

function updateReadme(total) {
  const table = buildCoverageTable(total);
  const badgeMarkdown = '![Coverage Status](./badges/coverage.svg)';
  const section = `## Test Coverage\n\n${badgeMarkdown}\n\n${TABLE_START}\n${table}\n${TABLE_END}\n\n`;
  const readme = fs.readFileSync(README_PATH, 'utf8');

  const sectionRegex = /## Test Coverage[\s\S]*?(?=^## |\Z)/m;
  if (sectionRegex.test(readme)) {
    return readme.replace(sectionRegex, section);
  }

  if (readme.includes(TABLE_START) && readme.includes(TABLE_END)) {
    const markersRegex = new RegExp(`${TABLE_START}[\\s\\S]*?${TABLE_END}`, 'm');
    return readme.replace(markersRegex, `${TABLE_START}\n${table}\n${TABLE_END}\n\n`);
  }

  return `${readme.trim()}\n\n${section}`;
}

function saveReadme(content) {
  fs.writeFileSync(README_PATH, content.endsWith('\n') ? content : `${content}\n`);
}

function main() {
  const total = readCoverageSummary();
  writeBadge(total.lines.pct);
  const updatedReadme = updateReadme(total);
  saveReadme(updatedReadme);
  console.log('Coverage badge and README updated.');
}

main();
