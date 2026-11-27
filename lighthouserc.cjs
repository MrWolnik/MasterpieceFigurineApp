// Lighthouse CI (PLAN Z4.3): audits the production build of the key pages on a throttled mobile
// profile and fails when any category scores below 0.9. Run with `npm run lighthouse` after
// `npm run build`; CI does the same in its own job.
const PORT = 4174;

module.exports = {
  ci: {
    collect: {
      // Like Netlify: compressed, clean URLs (`vite preview` compresses nothing).
      startServerCommand: `node scripts/serve-dist.mjs --port ${PORT}`,
      startServerReadyPattern: 'Serving dist',
      url: [
        `http://localhost:${PORT}/pl`,
        `http://localhost:${PORT}/pl/portfolio`,
        `http://localhost:${PORT}/pl/portfolio/nocny-wartownik`,
        `http://localhost:${PORT}/pl/kontakt`,
      ],
      // The median of several runs evens out noise on shared CI machines.
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
        // Real network and CPU throttling (a mid-range phone on slow 4G), not Lighthouse's default
        // simulation: the simulation overestimated the LCP of <picture> images by ~3.5 s here,
        // while measured runs show LCP equal to the first paint.
        throttlingMethod: 'devtools',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    // Reports stay on disk (a CI artifact), not on a public server.
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
