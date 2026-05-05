import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('assets');
const targetRoot = resolve('public');
const target = resolve('public/assets');

if (!existsSync(source)) {
  throw new Error(`Missing source assets directory: ${source}`);
}

await mkdir(targetRoot, { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
console.log('sync-public-assets: copied assets -> public/assets');
