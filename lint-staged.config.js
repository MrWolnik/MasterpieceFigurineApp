/** @param {string[]} files */
const quote = (files) => files.map((file) => JSON.stringify(file)).join(' ');

// Globs must not overlap: lint-staged runs different globs in parallel.
export default {
  '*.{ts,tsx}': (files) => [
    `prettier --write ${quote(files)}`,
    `eslint --fix ${quote(files)}`,
    `vitest related --run ${quote(files)}`,
    // Type errors can surface outside the staged files, so check the whole project once.
    'tsc -b --noEmit',
  ],
  '*.{js,mjs}': (files) => [`prettier --write ${quote(files)}`, `eslint --fix ${quote(files)}`],
  // Locale JSON feeds the typed i18n keys, so JSON changes also re-run the type check.
  '*.json': (files) => [`prettier --write ${quote(files)}`, 'tsc -b --noEmit'],
  '*.{css,md,html,yml,yaml}': (files) => `prettier --write ${quote(files)}`,
};
