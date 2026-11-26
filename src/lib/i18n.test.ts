import { describe, expect, it } from 'vitest';
import { detectLanguage, i18nFor, isLanguage } from './i18n';

describe('isLanguage', () => {
  it('accepts only supported languages', () => {
    expect(isLanguage('pl')).toBe(true);
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});

describe('detectLanguage', () => {
  it.each([
    [['en-US', 'pl'], 'en'],
    [['pl-PL'], 'pl'],
    [['EN-gb'], 'en'],
    [['de-DE', 'en'], 'en'],
    [['de-DE', 'fr'], 'pl'],
    [[], 'pl'],
  ] as const)('%j → %s', (preferred, expected) => {
    expect(detectLanguage(preferred)).toBe(expected);
  });
});

describe('i18nFor', () => {
  it('returns one fixed instance per language', () => {
    expect(i18nFor('en')).toBe(i18nFor('en'));
    expect(i18nFor('en').language).toBe('en');
    expect(i18nFor('pl').language).toBe('pl');
    expect(i18nFor('pl').t('pages.contact.title')).toBe('Kontakt');
  });
});
