import { site } from '../config/site';
import { i18nFor, type Language } from './i18n';
import { pathFor } from './routes';
import { absoluteUrl } from './siteUrl';

/** schema.org `Person` for Julia, as JSON-LD. */
export interface PersonJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  sameAs?: string[];
}

/**
 * Whether `url` points at a profile, not just a network's home page (`https://www.instagram.com/`,
 * the placeholder before launch). `sameAs` claims the page is Julia, so a home page must not go in.
 */
export function isProfileUrl(url: string): boolean {
  try {
    return new URL(url).pathname.replace(/\/+$/, '') !== '';
  } catch {
    return false; // empty or malformed
  }
}

/**
 * Structured data about Julia for search engines. The e-mail address is left out on purpose:
 * the site hides it from bots that read static HTML (see ProtectedEmail).
 */
export function personJsonLd(
  lang: Language,
  socials: readonly { url: string }[] = site.socials,
): PersonJsonLd {
  const { t } = i18nFor(lang);
  const sameAs = socials.map((social) => social.url).filter(isProfileUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.artistName,
    jobTitle: t('meta.jobTitle'),
    description: t('meta.home.description'),
    url: absoluteUrl(pathFor('home', lang)),
    image: absoluteUrl(site.portrait),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
