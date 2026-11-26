import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4173;
const DEV_PORT = 5173;
const isCI = Boolean(process.env.CI);

const previewCommand = `npm run preview -- --port ${String(PREVIEW_PORT)} --strictPort`;
const previewURL = `http://localhost:${String(PREVIEW_PORT)}`;
const devURL = `http://localhost:${String(DEV_PORT)}`;

// Dev-only pages (e.g. /styleguide) are not in the production build, so they run against `vite`.
const DEV_ONLY_SPECS = /(styleguide|turntable|image-zoom)\.spec\.ts/;

/**
 * Most e2e tests run against the production build served by `vite preview`,
 * the same artefact that CI builds and Netlify deploys.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: previewURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    ...(
      [
        ['chromium', 'Desktop Chrome'],
        ['firefox', 'Desktop Firefox'],
        ['webkit', 'Desktop Safari'],
        // iPhone profile: WebKit matters for the 360° turntable and scroll behaviour on iOS.
        ['mobile-safari', 'iPhone 15'],
      ] as const
    ).map(([name, device]) => ({
      name,
      testIgnore: DEV_ONLY_SPECS,
      use: { ...devices[device] },
    })),
    {
      name: 'dev-only',
      testMatch: DEV_ONLY_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL: devURL },
    },
    {
      // The turntable drag must also work in Safari (PLAN Z1.5).
      name: 'dev-only-webkit',
      testMatch: /turntable\.spec\.ts/,
      use: { ...devices['Desktop Safari'], baseURL: devURL },
    },
    {
      // Pinch-to-zoom on a phone in WebKit (PLAN Z1.6).
      name: 'dev-only-mobile-webkit',
      testMatch: /image-zoom\.spec\.ts/,
      use: { ...devices['iPhone 15'], baseURL: devURL },
    },
  ],
  webServer: [
    {
      // CI has already built the app in an earlier step, so it only serves `dist`.
      command: isCI ? previewCommand : `npm run build && ${previewCommand}`,
      url: previewURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --port ${String(DEV_PORT)} --strictPort`,
      url: devURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
