import { afterEach, describe, expect, it } from 'vitest';
import { createI18n, detectLanguage, isLanguage } from './i18n';

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

describe('createI18n', () => {
  afterEach(() => {
    document.documentElement.lang = '';
  });

  it('sets <html lang> on init and on every language change', async () => {
    const i18n = createI18n('pl');
    expect(document.documentElement.lang).toBe('pl');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
