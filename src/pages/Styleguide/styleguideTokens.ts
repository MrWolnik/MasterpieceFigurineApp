// Colour tokens shown on the styleguide page; names match `--color-*` in src/styles/tokens.css.
export const colorTokens = [
  { name: 'bg', usage: 'Page background' },
  { name: 'surface', usage: 'Cards, panels' },
  { name: 'text', usage: 'Body text' },
  { name: 'text-muted', usage: 'Secondary text' },
  { name: 'accent', usage: 'Links, highlights, focus' },
  { name: 'accent-hover', usage: 'Accent on hover' },
  { name: 'error', usage: 'Error backgrounds and borders only' },
  { name: 'error-text', usage: 'Error messages' },
] as const;
