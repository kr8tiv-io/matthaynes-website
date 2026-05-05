import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

describe('Astro couture rebuild contract', () => {
  it('keeps the public homepage, links route, and legacy links.html route', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts?: Record<string, string> };

    expect(existsSync(join(root, 'src/pages/index.astro'))).toBe(true);
    expect(existsSync(join(root, 'src/pages/links.astro'))).toBe(true);
    expect(existsSync(join(root, 'src/pages/links.html.astro'))).toBe(true);
    expect(existsSync(join(root, 'scripts/compat-routes.mjs'))).toBe(true);
    expect(pkg.scripts?.build).toContain('compat-routes.mjs');
  });

  it('preserves the four cinematic background video assets in public assets', () => {
    const videos = [
      'hero-header.mp4',
      'grok-abstract.mp4',
      'story-mid.mp4',
      'story-bottom.mp4'
    ];

    for (const video of videos) {
      expect(existsSync(join(root, 'assets/media', video))).toBe(true);
    }
  });

  it('uses the original video-first identity instead of the old fog/flora/firefly layers', () => {
    const index = read('src/pages/index.astro');
    const layout = read('src/layouts/BaseLayout.astro');
    const hero = read('src/components/HeroRitual.astro');
    const source = `${index}\n${layout}\n${hero}`;

    expect(source).toContain('VideoDirector');
    expect(source).toContain('SystemsMap');
    expect(source).toContain('RunwayNav');
    expect(hero).toContain('hero-signal-strip');
    expect(hero).not.toContain('stat-chip-grid');
    expect(index).not.toMatch(/global-flora|fireflies|fog|cloud|monstera|palm|fern/i);
  });

  it('keeps the Costa Rica videos immediate without a poster-image flash', () => {
    const director = read('src/components/VideoDirector.astro');
    const motion = read('src/scripts/coutureMotion.ts');

    expect(director).toContain('data-video-preloader');
    expect(director).not.toContain('poster=');
    expect(motion).toContain('hidePreloader');
  });

  it('removes the irrelevant Three.js systems canvas from the systems chapter', () => {
    const systems = read('src/components/SystemsMap.astro');

    expect(systems).not.toMatch(/canvas|systems-canvas|import\('three'\)|THREE/);
    expect(systems).toContain('system-orbit');
  });

  it('frames links as Matt found-link basket rather than invented project copy', () => {
    const linksPage = read('src/pages/links.astro');
    const linkConsole = read('src/components/LinkConsole.tsx');
    const linksData = JSON.parse(read('assets/data/links.json')) as { items?: Array<{ title?: string; category?: string }> };
    const categories = new Set((linksData.items ?? []).map((item) => item.category));

    expect(linksPage).toContain('found-link basket');
    expect(linksPage).not.toMatch(/Linktree cosplay|active ecosystem projects/i);
    expect(linkConsole).toContain('Search the found-link basket');
    expect(linksData.items?.length).toBeGreaterThanOrEqual(150);
    expect(categories.has('GitHub Repositories')).toBe(true);
    expect(categories.has('AI Models & Platforms')).toBe(true);
    expect(linksData.items?.some((item) => item.title === 'CrewAI')).toBe(true);
  });

  it('keeps Matt Haynes metadata, schema, and core outbound links', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    const content = read('src/data/site.ts');

    expect(layout).toContain('application/ld+json');
    expect(layout).toContain('https://matthaynes.fun/');
    expect(content).toContain('https://kr8tiv.ai/');
    expect(content).toContain('https://kr8tiv.io/');
    expect(content).toContain('https://jarvislife.io/');
    expect(content).toContain('https://meetyourkin.com/');
    expect(content).toContain('mailto:lucidbloks@gmail.com');
  });
});
