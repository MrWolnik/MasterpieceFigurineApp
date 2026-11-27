import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';
import { resolveFile, respond, SECURITY_HEADERS } from './serve-dist.mjs';

const dist = mkdtempSync(join(tmpdir(), 'dist-'));
mkdirSync(join(dist, 'pl/portfolio'), { recursive: true });
mkdirSync(join(dist, 'assets'));
writeFileSync(join(dist, 'index.html'), '<shell>');
writeFileSync(join(dist, 'pl.html'), '<pl>');
writeFileSync(join(dist, 'pl/portfolio.html'), '<portfolio>');
writeFileSync(join(dist, 'pl/portfolio/a.html'), '<work>');
writeFileSync(join(dist, 'assets/app-1.js'), 'console.log(1);'.repeat(50));
writeFileSync(join(dist, 'assets/a.avif'), 'binary');

afterAll(() => {
  rmSync(dist, { recursive: true, force: true });
});

describe('resolveFile', () => {
  it('serves clean URLs from their .html file, like Netlify', () => {
    expect(resolveFile(dist, '/pl')).toBe(join(dist, 'pl.html'));
    expect(resolveFile(dist, '/pl/portfolio')).toBe(join(dist, 'pl/portfolio.html'));
    expect(resolveFile(dist, '/pl/portfolio/a')).toBe(join(dist, 'pl/portfolio/a.html'));
    expect(resolveFile(dist, '/assets/app-1.js')).toBe(join(dist, 'assets/app-1.js'));
  });

  it('falls back to the SPA shell for anything else, never leaving dist', () => {
    expect(resolveFile(dist, '/')).toBe(join(dist, 'index.html'));
    expect(resolveFile(dist, '/en/unknown')).toBe(join(dist, 'index.html'));
    expect(resolveFile(dist, '/../../etc/passwd')).toBe(join(dist, 'index.html'));
  });
});

describe('respond', () => {
  const js = join(dist, 'assets/app-1.js');

  it('compresses text with Brotli or gzip, as the client accepts', () => {
    const br = respond(js, '/assets/app-1.js', 'gzip, deflate, br');
    expect(br.headers['Content-Encoding']).toBe('br');
    expect(brotliDecompressSync(br.body).toString()).toContain('console.log(1);');

    const gzip = respond(js, '/assets/app-1.js', 'gzip');
    expect(gzip.headers['Content-Encoding']).toBe('gzip');
    expect(gunzipSync(gzip.body).toString()).toContain('console.log(1);');

    expect(respond(js, '/assets/app-1.js', '').headers['Content-Encoding']).toBeUndefined();
  });

  it('leaves already compressed images alone', () => {
    const image = respond(join(dist, 'assets/a.avif'), '/assets/a.avif', 'br');
    expect(image.headers['Content-Type']).toBe('image/avif');
    expect(image.headers['Content-Encoding']).toBeUndefined();
  });

  it('caches hashed assets for a year and pages not at all', () => {
    expect(respond(js, '/assets/app-1.js').headers['Cache-Control']).toContain('immutable');
    expect(respond(join(dist, 'pl.html'), '/pl').headers['Cache-Control']).toContain('max-age=0');
  });
});

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');

/** public/_headers as { path: { header: value } } (Netlify's format: path, indented headers). */
function parseHeadersFile(text) {
  const rules = {};
  let current;
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (/^\S/.test(line)) {
      current = rules[line.trim()] = {};
    } else if (current) {
      const colon = line.indexOf(':');
      current[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
  }
  return rules;
}

describe('security headers', () => {
  const netlify = parseHeadersFile(readFileSync(join(repo, 'public/_headers'), 'utf8'));

  it('are the same in public/_headers (Netlify) and in this server', () => {
    expect(netlify['/*']).toEqual(SECURITY_HEADERS);
  });

  it('come with every response', () => {
    expect(respond(join(dist, 'pl.html'), '/pl').headers).toMatchObject(SECURITY_HEADERS);
    expect(respond(join(dist, 'assets/a.avif'), '/assets/a.avif').headers).toMatchObject(
      SECURITY_HEADERS,
    );
  });

  it('keep the long caching of hashed assets in public/_headers', () => {
    expect(netlify['/assets/*']).toEqual({
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  });
});

describe('netlify.toml', () => {
  const toml = readFileSync(join(repo, 'netlify.toml'), 'utf8');

  it('builds with the npm script and publishes the folder Vite and the prerender write', () => {
    expect(toml).toMatch(/^\s*command = "npm run build"$/m);
    expect(toml).toMatch(/^\s*publish = "dist"$/m);
  });
});
