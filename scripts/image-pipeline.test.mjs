import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { isSourceImage, isStale, optimizeImages } from './image-pipeline.mjs';

// sharp keeps recently read files open in its cache, which on Windows blocks deleting them.
sharp.cache(false);

describe('isSourceImage', () => {
  it('takes photos and SVG placeholders', () => {
    for (const path of [
      '/works/a/cover.jpg',
      '/works/a/cover.JPEG',
      '/julia.svg',
      '/a.png',
      '/b.webp',
    ]) {
      expect(isSourceImage(path), path).toBe(true);
    }
  });

  it('leaves out generated variants, @2x zoom files, the favicon, the share image and non-images', () => {
    for (const path of [
      '/img/works/a/cover-800.webp',
      '/works/a/full@2x.jpg',
      '/favicon.svg',
      '/og-image.png',
      '/_redirects',
      '/works/a/notes.txt',
    ]) {
      expect(isSourceImage(path), path).toBe(false);
    }
  });
});

describe('isStale', () => {
  it('is stale when an output is missing or older than the source', () => {
    expect(isStale(100, [200, undefined])).toBe(true);
    expect(isStale(100, [200, 50])).toBe(true);
    expect(isStale(100, [100, 200])).toBe(false);
  });
});

describe('optimizeImages', () => {
  const dirs = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  });

  async function publicDir() {
    const dir = mkdtempSync(join(tmpdir(), 'public-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'works/a/frames'), { recursive: true });
    writeFileSync(
      join(dir, 'works/a/cover.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="#b8893b"/></svg>',
    );
    await sharp({ create: { width: 640, height: 480, channels: 3, background: '#222' } })
      .png()
      .toFile(join(dir, 'works/a/frames/001.png'));
    writeFileSync(join(dir, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    return dir;
  }

  it('writes every variant, rasterising SVG sharply and never enlarging photos', async () => {
    const dir = await publicDir();
    expect(await optimizeImages(dir)).toEqual({ generated: 2, upToDate: 0 });

    const cover = await sharp(join(dir, 'img/works/a/cover-1600.avif')).metadata();
    expect(cover).toMatchObject({ width: 1600, height: 1067 });
    expect(existsSync(join(dir, 'img/works/a/cover-480.webp'))).toBe(true);

    const frame = await sharp(join(dir, 'img/works/a/frames/001-800.webp')).metadata();
    expect(frame.width).toBe(640);
    expect(existsSync(join(dir, 'img/favicon-480.webp'))).toBe(false);
  }, 30_000);

  it('skips images whose variants are up to date and redoes changed ones', async () => {
    const dir = await publicDir();
    await optimizeImages(dir);
    expect(await optimizeImages(dir)).toEqual({ generated: 0, upToDate: 2 });

    const later = new Date(Date.now() + 60_000);
    utimesSync(join(dir, 'works/a/cover.svg'), later, later);
    expect(await optimizeImages(dir)).toEqual({ generated: 1, upToDate: 1 });
  }, 30_000);
});
