import { describe, expect, it } from 'vitest';
import en from './en.json';
import pl from './pl.json';

/** Flattens nested translations into `[dotted.key, value]` pairs (`['pages.contact.title', 'Kontakt']`). */
function entriesOf(value: unknown, prefix = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) {
    return [[prefix, value]];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    entriesOf(child, prefix ? `${prefix}.${key}` : key),
  );
}

const keysOf = (locale: unknown) => entriesOf(locale).map(([key]) => key);

describe('locale files', () => {
  it('pl.json and en.json have exactly the same keys', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(pl).sort());
  });

  it.each([
    ['pl', pl],
    ['en', en],
  ])('%s.json has no empty translations', (_name, locale) => {
    const empty = entriesOf(locale)
      .filter(([, text]) => typeof text !== 'string' || text.trim() === '')
      .map(([key]) => key);

    expect(empty).toEqual([]);
  });
});
