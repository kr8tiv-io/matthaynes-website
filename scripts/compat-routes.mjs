import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distRoot = join(process.cwd(), 'dist');
const generatedLegacyDir = join(distRoot, 'links.html');
const generatedLegacyIndex = join(generatedLegacyDir, 'index.html');
const flatLegacyFile = join(distRoot, 'links.html');

if (!existsSync(generatedLegacyIndex)) {
  throw new Error('Expected Astro to generate dist/links.html/index.html for legacy route compatibility.');
}

const legacyHtml = readFileSync(generatedLegacyIndex, 'utf8');

rmSync(generatedLegacyDir, { recursive: true, force: true });
mkdirSync(dirname(flatLegacyFile), { recursive: true });
writeFileSync(flatLegacyFile, legacyHtml);

console.log('compat-routes: wrote dist/links.html as a flat legacy route.');
