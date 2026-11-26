import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { createI18n, type Language } from './i18n';
import { useTagLabel } from './useTagLabel';

function renderTagLabel(language: Language) {
  const i18n = createI18n(language);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );
  return renderHook(() => useTagLabel(), { wrapper }).result.current;
}

describe('useTagLabel', () => {
  it('translates known tags in the active language', () => {
    expect(renderTagLabel('pl')('olej')).toBe('Olej');
    expect(renderTagLabel('en')('olej')).toBe('Oil');
  });

  it('falls back to the raw id for unknown tags', () => {
    expect(renderTagLabel('en')('unknown-tag')).toBe('unknown-tag');
  });
});
