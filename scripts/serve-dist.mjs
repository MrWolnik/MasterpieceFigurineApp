// Serves the production build like Netlify does, for Lighthouse CI: clean URLs
// (`/pl/kontakt` → `pl/kontakt.html`), the SPA fallback from public/_redirects, Brotli/gzip
// compression and long caching of hashed assets (public/_headers). `vite preview` compresses
// nothing, which would make the scores far worse than the real site's.
// Usage: node scripts/serve-dist.mjs [--port 4174]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.svg']);
const IMMUTABLE = 'public, max-age=31536000, immutable';

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

/**
 * The file Netlify would serve for `pathname`: the file itself, else `<path>.html`, else the
 * SPA shell `index.html` (status 200, as in public/_redirects). Never leaves `dist`.
 */
export function resolveFile(dist, pathname) {
  const root = resolve(dist);
  const target = normalize(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return join(root, 'index.html');
  if (isFile(target)) return target;
  if (isFile(`${target}.html`)) return `${target}.html`;
  return join(root, 'index.html');
}

/** Response headers and body for a file, compressed for the client when worthwhile. */
export function respond(file, pathname, acceptEncoding = '') {
  const type = extname(file);
  const headers = {
    'Content-Type': TYPES[type] ?? 'application/octet-stream',
    'Cache-Control': pathname.startsWith('/assets/')
      ? IMMUTABLE
      : 'public, max-age=0, must-revalidate',
    Vary: 'Accept-Encoding',
  };
  let body = readFileSync(file);
  if (COMPRESSIBLE.has(type)) {
    if (/\bbr\b/.test(acceptEncoding)) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
      headers['Content-Encoding'] = 'br';
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      body = gzipSync(body, { level: 9 });
      headers['Content-Encoding'] = 'gzip';
    }
  }
  return { headers, body };
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const ENCODINGS = ['br', 'gzip', ''];

function pickEncoding(acceptEncoding) {
  if (/br/.test(acceptEncoding)) return 'br';
  if (/gzip/.test(acceptEncoding)) return 'gzip';
  return '';
}

/**
 * Starts the server. Every response is prepared up front (like Netlify, which stores compressed
 * files), so slow Brotli compression never delays a request while Lighthouse measures.
 */
export async function serve(dist, port) {
  const root = resolve(dist);
  const prepared = new Map();
  for (const file of listFiles(root)) {
    for (const encoding of ENCODINGS) {
      const pathname = `/${file
        .slice(root.length + 1)
        .split(sep)
        .join('/')}`;
      prepared.set(`${file}|${encoding}`, respond(file, pathname, encoding));
    }
  }

  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    const file = resolveFile(root, pathname);
    const encoding = pickEncoding(String(request.headers['accept-encoding'] ?? ''));
    const { headers, body } =
      prepared.get(`${file}|${encoding}`) ?? respond(file, pathname, encoding);
    response.writeHead(200, { ...headers, 'Content-Length': body.length });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
  await new Promise((done) => server.listen(port, () => done(undefined)));
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const portFlag = process.argv.indexOf('--port');
  const port = portFlag > 0 ? Number(process.argv[portFlag + 1]) : 4174;
  const dist = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
  await serve(dist, port);
  console.log(`Serving dist on http://localhost:${String(port)}`);
}
