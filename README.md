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

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request into `main` and on every push to `main`:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:coverage`
4. `npm run build`
5. `npm run test:e2e` (Playwright against the built site)

npm packages and Playwright browsers are cached between runs. When a run fails, the Playwright
HTML report and traces are uploaded as the `playwright-report` artifact (kept 14 days): open the
failed run on GitHub → **Summary** → **Artifacts**, download it and run
`npx playwright show-report <unzipped-folder>/playwright-report`.

The Node.js version comes from `.nvmrc`.

### Protecting `main` (merge only with green CI)

> Branch protection and rulesets on **private** repositories need **GitHub Pro** (or a Team
> organisation). On the Free plan GitHub returns
> _"Upgrade to GitHub Pro or make this repository public to enable this feature"_.
> Until then, the rule is followed by convention: merge only when the CI check is green.

With GitHub Pro (or a public repository):

1. Open the repository on GitHub → **Settings** → **Rules** → **Rulesets** → **New ruleset** →
   **New branch ruleset**.
2. Name it `main`, set **Enforcement status** to **Active**.
3. **Target branches** → **Add target** → **Include default branch**.
4. Enable:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging**
   - **Require status checks to pass** → **Add checks** → choose
     `Lint, typecheck, test, build, e2e` (it appears after CI has run at least once), and tick
     **Require branches to be up to date before merging**.
5. **Create**.

## Environment variables

| Name            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `VITE_SITE_URL` | Public site URL (canonical links, sitemap, OG, hreflang). |

Never commit `.env`. Only `.env.example` is tracked.

## Contributing

Work on a branch (`feat/...`, `fix/...`, `test/...`, `chore/...`), use
[Conventional Commits](https://www.conventionalcommits.org/), and open a pull request into `main`.
Rules for Claude Code are in [`CLAUDE.md`](./CLAUDE.md).
