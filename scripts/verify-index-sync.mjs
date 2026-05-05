import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const rootIndexPath = path.join(repoRoot, 'index.html');
const siteIndexPath = path.join(repoRoot, 'site', 'index.html');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function getAttrValues(html, tagName, attrName) {
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const attrPattern = new RegExp(`${attrName}\\s*=\\s*['\"]([^'\"]+)['\"]`, 'i');
  const values = [];
  const tags = html.match(tagPattern) ?? [];
  for (const tag of tags) {
    const match = tag.match(attrPattern);
    if (match) values.push(match[1]);
  }
  return values;
}

function stripBaseTag(html) {
  return html.replace(/<base\b[^>]*>\s*/i, '');
}

function normalizeForComparison(html) {
  return html.replace(/\r\n/g, '\n').replace(/>\s+</g, '><').trim();
}

if (!existsSync(rootIndexPath) || !existsSync(siteIndexPath)) {
  fail('Both index.html and site/index.html must exist.');
  process.exit(process.exitCode ?? 1);
}

const rootHtml = readFileSync(rootIndexPath, 'utf8');
const siteHtml = readFileSync(siteIndexPath, 'utf8');

const baseValues = getAttrValues(rootHtml, 'base', 'href');
if (baseValues.length !== 1 || baseValues[0] !== './site/') {
  fail('Root index.html must contain exactly one <base href="./site/"> tag.');
}

const rootScripts = getAttrValues(rootHtml, 'script', 'src');
const siteScripts = getAttrValues(siteHtml, 'script', 'src');
if (JSON.stringify(rootScripts) !== JSON.stringify(siteScripts)) {
  fail('Script src references differ between root index.html and site/index.html.');
}

const rootStyles = getAttrValues(rootHtml, 'link', 'href');
const siteStyles = getAttrValues(siteHtml, 'link', 'href');
if (JSON.stringify(rootStyles) !== JSON.stringify(siteStyles)) {
  fail('Link href references differ between root index.html and site/index.html.');
}

const requiredAnchors = [
  'id="board"',
  'id="statusMessage"',
  'id="newRoundButton"',
  'id="resetGameButton"',
  'id="resetScoresButton"',
  'id="settingsButton"',
  'id="settingsModal"',
  'id="settingsForm"'
];

for (const anchor of requiredAnchors) {
  if (!rootHtml.includes(anchor)) {
    fail(`Missing required runtime anchor in root index.html: ${anchor}`);
  }

  if (!siteHtml.includes(anchor)) {
    fail(`Missing required runtime anchor in site/index.html: ${anchor}`);
  }
}

const normalizedRoot = normalizeForComparison(stripBaseTag(rootHtml));
const normalizedSite = normalizeForComparison(siteHtml);
if (normalizedRoot !== normalizedSite) {
  fail('Root index.html must mirror site/index.html except for the <base> tag.');
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\nRoot/site index sync verification failed.');
  process.exit(process.exitCode);
}

console.log('✅ Root index.html is synchronized with site/index.html integration expectations.');
