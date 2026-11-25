import 'i18next';
import type { resources } from './lib/i18n';

// Gives `t()` type-safe keys based on the Polish (default) locale file.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['pl'];
  }
}
