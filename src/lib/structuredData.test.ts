import { describe, expect, it } from 'vitest';
import { site } from '../config/site';
import { absoluteUrl } from './siteUrl';
import { isProfileUrl, personJsonLd } from './structuredData';

describe('personJsonLd', () => {
  it('describes Julia as a schema.org Person in the page language', () => {
    const person = personJsonLd('en');
    expect(person).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.artistName,
      jobTitle: 'Miniature and fine art painter',
      url: absoluteUrl('/en'),
      image: absoluteUrl(site.portrait),
    });
    expect(personJsonLd('pl').jobTitle).toBe('Malarka figurek i obrazów');
  });

  it('never contains the e-mail address, which the site hides from bots', () => {
    const json = JSON.stringify([personJsonLd('pl'), personJsonLd('en')]);
    expect(json).not.toContain(site.contactEmail);
  });

  it('lists only the social profiles that have a link', () => {
    expect(personJsonLd('pl', [{ url: '' }, { url: '' }])).not.toHaveProperty('sameAs');
    expect(
      personJsonLd('pl', [{ url: 'https://instagram.com/julia' }, { url: '' }]).sameAs,
    ).toEqual(['https://instagram.com/julia']);
  });

  it('leaves out network home pages, which are not Julia (the placeholders before launch)', () => {
    expect(
      personJsonLd('pl', [
        { url: 'https://www.instagram.com/' },
        { url: 'https://www.youtube.com/@julia' },
      ]).sameAs,
    ).toEqual(['https://www.youtube.com/@julia']);
    expect(personJsonLd('pl')).not.toHaveProperty('sameAs');
  });
});

describe('isProfileUrl', () => {
  it.each([
    ['https://instagram.com/julia', true],
    ['https://www.youtube.com/@julia/', true],
    ['https://www.instagram.com/', false],
    ['https://www.tiktok.com', false],
    ['', false],
    ['not a url', false],
  ])('%s → %s', (url, expected) => {
    expect(isProfileUrl(url)).toBe(expected);
  });
});
