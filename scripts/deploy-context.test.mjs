import { describe, expect, it } from 'vitest';
import { isProductionDeploy, NOINDEX_HEADERS } from './deploy-context.mjs';

describe('isProductionDeploy', () => {
  it('treats Netlify production and local or CI builds as production', () => {
    expect(isProductionDeploy('production')).toBe(true);
    expect(isProductionDeploy(undefined)).toBe(true);
    expect(isProductionDeploy('')).toBe(true);
  });

  it('treats previews and branch deploys as not indexable', () => {
    expect(isProductionDeploy('deploy-preview')).toBe(false);
    expect(isProductionDeploy('branch-deploy')).toBe(false);
    expect(isProductionDeploy('dev')).toBe(false);
  });
});

describe('NOINDEX_HEADERS', () => {
  it('sends noindex for every path, in _headers syntax', () => {
    expect(NOINDEX_HEADERS).toMatch(/^\/\*\n {2}X-Robots-Tag: noindex$/m);
  });
});
