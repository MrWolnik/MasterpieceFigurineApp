import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../lib/i18n';
import { useOrderPrefill } from './useOrderPrefill';

function prefill(route: string) {
  const i18n = createI18n('pl');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </I18nextProvider>
  );
  return renderHook(() => useOrderPrefill(), { wrapper }).result.current;
}

describe('useOrderPrefill', () => {
  it('defaults to a figurine with an empty description', () => {
    expect(prefill('/pl/kontakt')).toMatchObject({ kind: 'figurine', description: '' });
  });

  it('presets the kind and the referenced work', () => {
    expect(prefill('/pl/kontakt?kind=painting&ref=mgla-nad-bagnem')).toMatchObject({
      kind: 'painting',
      description: 'Chcę podobną pracę do: Mgła nad bagnem. ',
    });
  });

  it('ignores an unknown kind and an unknown work', () => {
    expect(prefill('/pl/kontakt?kind=sculpture&ref=nope')).toMatchObject({
      kind: 'figurine',
      description: '',
    });
  });

  it('takes the kind from the work when only ?ref= is given', () => {
    expect(prefill('/pl/kontakt?ref=mgla-nad-bagnem').kind).toBe('painting');
  });
});
