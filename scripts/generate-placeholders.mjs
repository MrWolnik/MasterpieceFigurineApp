// Generates SVG placeholder images for the sample works in src/content/works.
// Usage: node scripts/generate-placeholders.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BODY_RADIUS, surfacePoint } from './turntable-geometry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const worksDir = join(root, 'src/content/works');

/** Painting proportions, keyed by the `size` field ("W × H cm"). */
function sizeToBox(size) {
  const [w, h] = size.match(/\d+/g).map(Number);
  const scale = 1200 / Math.max(w, h);
  return [Math.round(w * scale), Math.round(h * scale)];
}

function svg(width, height, label, sub, hue) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 35% 22%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 30% 10%)"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="50%" y="48%" fill="#d8b76a" font-family="serif" font-size="${Math.round(width / 14)}" text-anchor="middle">${label}</text>
<text x="50%" y="58%" fill="#cfc6b4" font-family="sans-serif" font-size="${Math.round(width / 28)}" text-anchor="middle">${sub}</text>
</svg>
`;
}

/**
 * Figurine on a turntable rotated by `angle` degrees. A gold stripe on the body, a staff held
 * on one side and a notch on the base move around the figure (x = r·sin θ, in front while
 * cos θ > 0), so the sequence reads as a full 360° turn rather than a back-and-forth squash.
 */
function frameSvg(label, index, total, hue) {
  const angle = Math.round((360 / total) * index);
  const stripe = surfacePoint(angle);
  const staff = surfacePoint(angle, 90, BODY_RADIUS + 45);
  const notch = surfacePoint(angle, 0, 220);
  const stripeW = 36 * stripe.width;
  const stripeSvg = stripe.front
    ? `<rect x="${(stripe.x - stripeW / 2).toFixed(1)}" y="-180" width="${stripeW.toFixed(1)}" height="380" fill="#d8b76a" clip-path="url(#body)"/>`
    : '';
  const staffSvg = `<g opacity="${staff.front ? 1 : 0.45}"><rect x="${(staff.x - 9).toFixed(1)}" y="-260" width="18" height="470" rx="9" fill="#8a6a3a"/><circle cx="${staff.x.toFixed(1)}" cy="-270" r="26" fill="#d8b76a"/></g>`;
  const body = `<rect x="-80" y="-180" width="160" height="380" rx="60" fill="hsl(${hue} 40% 40%)"/><rect x="-80" y="-180" width="160" height="380" rx="60" fill="url(#shade)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient><clipPath id="body"><rect x="-80" y="-180" width="160" height="380" rx="60"/></clipPath></defs>
<rect width="100%" height="100%" fill="hsl(${hue} 25% 12%)"/>
<ellipse cx="400" cy="640" rx="220" ry="40" fill="#2a2620"/>
<circle cx="${(400 + notch.x).toFixed(1)}" cy="${(640 + 40 * notch.depth).toFixed(1)}" r="10" fill="#d8b76a" opacity="${notch.front ? 1 : 0.4}"/>
<g transform="translate(400 400)">${staff.front ? '' : staffSvg}${body}${stripeSvg}${staff.front ? staffSvg : ''}</g>
<text x="400" y="90" fill="#d8b76a" font-family="serif" font-size="44" text-anchor="middle">${label}</text>
<text x="400" y="750" fill="#cfc6b4" font-family="sans-serif" font-size="32" text-anchor="middle">${String(index + 1).padStart(3, '0')} / ${total} · ${angle}°</text>
</svg>
`;
}

function write(publicPath, content) {
  const file = join(root, 'public', publicPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

// Portrait of Julia for the home page hero (dark, warm tones; portrait 4:5).
write(
  '/julia.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<defs><radialGradient id="g" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#3a3125"/><stop offset="1" stop-color="#0e0d0b"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="400" cy="360" r="130" fill="#1f1b16"/>
<path d="M170 1000c0-190 100-330 230-330s230 140 230 330z" fill="#1f1b16"/>
<text x="400" y="900" fill="#9a9183" font-family="sans-serif" font-size="32" text-anchor="middle">Julia · photo placeholder</text>
</svg>
`,
);

readdirSync(worksDir)
  .filter((name) => name.endsWith('.json'))
  .forEach((name, i) => {
    const work = JSON.parse(readFileSync(join(worksDir, name), 'utf8'));
    const hue = (i * 47) % 360;
    const label = work.title.en;

    if (work.kind === 'painting') {
      const [w, h] = sizeToBox(work.size);
      write(work.cover, svg(w, h, label, 'cover', hue));
      write(work.image, svg(w, h, label, work.size, hue));
      write(work.imageHiRes, svg(w * 2, h * 2, label, `${work.size} · hi-res`, hue));
    } else {
      write(work.cover, svg(800, 1000, label, 'cover', hue));
      for (let f = 0; f < (work.frames ?? 0); f++) {
        const frame = `/works/${work.slug}/frames/${String(f + 1).padStart(3, '0')}.svg`;
        write(frame, frameSvg(label, f, work.frames, hue));
      }
    }
    work.images.forEach((img, n) => write(img, svg(800, 800, label, `detail ${n + 1}`, hue)));
  });
