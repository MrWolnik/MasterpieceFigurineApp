import { describe, expect, it } from 'vitest';
import { site } from '../config/site';
import { absoluteUrl } from './siteUrl';
import { personJsonLd } from './structuredData';

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
    expect(json).not.toContain('@gmail');
  });

  it('lists only the social profiles that have a link', () => {
    expect(personJsonLd('pl', [{ url: '' }, { url: '' }])).not.toHaveProperty('sameAs');
    expect(
      personJsonLd('pl', [{ url: 'https://instagram.com/julia' }, { url: '' }]).sameAs,
    ).toEqual(['https://instagram.com/julia']);
  });
});
