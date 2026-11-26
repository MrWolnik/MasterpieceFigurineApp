import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { createI18n } from './i18n';
import { useLanguage } from './useLanguage';

function renderUseLanguage(i18n = createI18n()) {
  return renderHook(() => useLanguage(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    ),
  });
}

describe('useLanguage', () => {
  it('returns the active language', () => {
    expect(renderUseLanguage(createI18n('en')).result.current).toBe('en');
  });

  it('falls back to Polish for an unsupported language', async () => {
    const i18n = createI18n('en');
    await i18n.changeLanguage('de');

    expect(renderUseLanguage(i18n).result.current).toBe('pl');
  });
});
