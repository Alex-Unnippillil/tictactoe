import { access, cp, mkdir, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const siteDir = join(root, 'site');
const distDir = join(root, 'dist');

async function ensureSiteExists() {
  try {
    await access(siteDir, constants.R_OK);
  } catch (error) {
    console.error('The site/ directory is required to build the project.');
    throw error;
  }
}

async function build() {
  await ensureSiteExists();
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await cp(siteDir, distDir, { recursive: true });
  console.log('Build complete: copied site/ into dist/.');
}

build().catch((error) => {
  console.error('Build failed.', error);
  process.exitCode = 1;
});
