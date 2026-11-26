import { describe, expect, it } from 'vitest';
import en from './en.json';
import pl from './pl.json';

/** Flattens nested translation objects into dotted keys (`pages.contact.title`). */
function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('locale files', () => {
  it('pl.json and en.json have exactly the same keys', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(pl).sort());
  });

  it('have no empty translations', () => {
    for (const [name, locale] of Object.entries({ pl, en })) {
      const empty = keysOf(locale).filter((key) => {
        const text = key
          .split('.')
          .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], locale);
        return typeof text !== 'string' || text.trim() === '';
      });
      expect(empty, name).toEqual([]);
    }
  });
});
