# MasterpieceFigurineJ

Portfolio and commission site for Julia, an artist who paints figurines and paintings.
Bilingual (Polish default, English). See [`PLAN.md`](./PLAN.md) for the full plan and task list.

## Requirements

- Node.js 20.19+ (developed on Node 26)
- npm

## Getting started

```bash
npm install
cp .env.example .env   # fill in values if needed
npm run test:e2e:install   # one-time: download Playwright browsers
npm run dev
```

## Scripts

| Script                     | What it does                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`              | Start the Vite dev server                                                     |
| `npm run build`            | Type-check and build for production                                           |
| `npm run preview`          | Serve the production build locally                                            |
| `npm run lint`             | Run ESLint                                                                    |
| `npm run lint:fix`         | Run ESLint and auto-fix what it can                                           |
| `npm run typecheck`        | Run the TypeScript compiler without output                                    |
| `npm run format`           | Format all files with Prettier                                                |
| `npm run format:check`     | Check formatting without writing                                              |
| `npm run test`             | Run unit and component tests (Vitest)                                         |
| `npm run test:watch`       | Run Vitest in watch mode                                                      |
| `npm run test:coverage`    | Run Vitest with a coverage report (`coverage/`)                               |
| `npm run test:e2e`         | Build, serve and run Playwright e2e tests (Chromium, Firefox, WebKit, iPhone) |
| `npm run test:e2e:install` | Download Playwright browsers and system dependencies                          |

## Testing

- **Unit and component tests** live next to the code as `*.test.ts(x)`. Render components with
  `renderWithProviders()` from `src/test/test-utils.tsx` (router + i18n, returns a `user`).
- **Network** is mocked with MSW (`src/test/msw-handlers.ts`). Unhandled requests fail the test.
- **E2E tests** live in `/e2e` and run against the production build (`vite preview`).
  Accessibility is checked with `@axe-core/playwright`.
- **Pre-commit hook** (Husky + lint-staged) runs Prettier, ESLint, related Vitest tests and the
  type check on staged files.

## Environment variables

| Name            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `VITE_SITE_URL` | Public site URL (canonical links, sitemap, OG, hreflang). |

Never commit `.env`. Only `.env.example` is tracked.

## Contributing

Work on a branch (`feat/...`, `fix/...`, `test/...`, `chore/...`), use
[Conventional Commits](https://www.conventionalcommits.org/), and open a pull request into `main`.
Rules for Claude Code are in [`CLAUDE.md`](./CLAUDE.md).
