import { site } from '../config/site';

/** The public site URL (`VITE_SITE_URL`) without a trailing slash. */
export function siteOrigin(): string {
  return site.url.replace(/\/+$/, '');
}

/** Absolute URL of a site path, e.g. `/pl/portfolio` → `https://…/pl/portfolio`. */
export function absoluteUrl(path: string): string {
  return `${siteOrigin()}${path}`;
}
