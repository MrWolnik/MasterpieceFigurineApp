import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadWorks } from './vite-plugin-works';

const dirs: string[] = [];

function contentDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'works-'));
  dirs.push(dir);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const work = (slug: string, order: number) =>
  JSON.stringify({
    kind: 'figurine',
    slug,
    title: { pl: 'A', en: 'A' },
    description: { pl: 'A', en: 'A' },
    cover: `/works/${slug}/cover.svg`,
    order,
  });

describe('loadWorks', () => {
  it('validates the site content', () => {
    const works = loadWorks(join(import.meta.dirname, '../src/content/works'));
    expect(works.length).toBeGreaterThan(0);
  });

  it('returns the works sorted, with defaults filled in, ignoring other files', () => {
    const dir = contentDir({ 'b.json': work('b', 2), 'a.json': work('a', 1), 'notes.md': '#' });
    const works = loadWorks(dir);
    expect(works.map((w) => w.slug)).toEqual(['a', 'b']);
    expect(works[0]).toMatchObject({ tags: [], featured: false, coverFocus: '50% 50%' });
  });

  it('names the file when its JSON is broken', () => {
    const dir = contentDir({ 'a.json': '{ "kind": ' });
    expect(() => loadWorks(dir)).toThrow(/Invalid work file \/src\/content\/works\/a\.json/);
  });

  it('names the file and field when a work is invalid', () => {
    const dir = contentDir({ 'a.json': work('a', 1).replace('"order":1', '"order":"x"') });
    expect(() => loadWorks(dir)).toThrow(/a\.json[\s\S]*order/);
  });
});
