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
| `npm run build`            | Type-check, build for production and prerender every page (see below)         |
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
| `npm run images`           | Generate AVIF/WebP image variants into `public/img` (runs before dev/build)   |
| `npm run lighthouse`       | Lighthouse CI on the built site (score ≥ 0.9 in every category)               |

## Design tokens

Colours, type, spacing and motion live in `src/styles/tokens.css`; base styles and the reset in
`src/styles/global.css`. Run `npm run dev` and open <http://localhost:5173/styleguide> to see
them all. The styleguide exists only in development and is left out of production builds.

## Testing

- **Unit and component tests** live next to the code as `*.test.ts(x)`. Render components with
  `renderWithProviders()` from `src/test/test-utils.tsx` (router + i18n, returns a `user`).
- **Network** is mocked with MSW (`src/test/msw-handlers.ts`). Unhandled requests fail the test.
- **E2E tests** live in `/e2e` and run against the production build (`vite preview`).
  Dev-only pages (`e2e/styleguide.spec.ts`) run against the dev server in the `dev-only` project.
  Accessibility is checked with `@axe-core/playwright`: `e2e/a11y.spec.ts` scans every page in
  the built sitemap (both languages) plus the 404 page, walks one page of each kind with Tab to
  check that every focused element shows an unclipped focus ring, and checks image text
  alternatives. States that need an interaction (open menu, form errors, filters) are scanned in
  their own specs.
- **Pre-commit hook** (Husky + lint-staged) runs Prettier, ESLint, related Vitest tests and the
  type check on staged files.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request into `main` and on every push to `main`:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:coverage`
4. `npm run build`
5. `npm run test:e2e` (Playwright against the built site)

A second job, **Lighthouse**, builds the site and runs `npm run lighthouse` in parallel: the home,
portfolio, a figurine and the contact page must score at least 0.9 in Performance,
Accessibility, Best Practices and SEO (throttled phone, median of 3 runs). Its reports are
uploaded as the `lighthouse-reports` artifact.

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
     `Lint, typecheck, test, build, e2e` and `Lighthouse` (they appear after CI has run at least
     once), and tick
     **Require branches to be up to date before merging**.
5. **Create**.

## Performance

- **Images.** Put the original photo in `public/` (e.g. `public/works/<slug>/cover.jpg`) and
  reference it in the work's JSON. `npm run images` (run automatically before `dev` and `build`)
  writes AVIF and WebP copies 480–1600 px wide into `public/img/` (git-ignored), only for new or
  changed files; pages pick the right one with `srcset`. Turntable frames get one 800 px WebP;
  `@2x` files are left as they are for the zoom viewer.
- **Code splitting.** Every page except home is its own chunk (`src/router.tsx`), so e.g. the
  order form and its validation load only on the contact page. Work files are validated at build
  time (`scripts/vite-plugin-works.ts`), keeping zod out of the other pages.
- **Loading order.** A prerendered page links its own stylesheet and preloads its fonts (Latin,
  plus Latin Extended in Polish), and fetches its JS only after the first paint: text and images
  come first, interactivity a moment later.
- **Lighthouse.** `npm run build && npm run lighthouse` audits the build locally (needs Google
  Chrome) through `scripts/serve-dist.mjs`, which serves `dist` the way Netlify does (compressed,
  clean URLs). `public/_headers` lets browsers cache the hashed files in `/assets` for a year.

## Prerendering and SEO

`npm run build` ends with `scripts/prerender.mjs`. It builds `src/entry-server.tsx` for Node and
writes every page in both languages to static HTML (`dist/pl/kontakt.html` serves `/pl/kontakt`),
together with `sitemap.xml` and `robots.txt`. Each page carries its title, description, canonical
and `hreflang` links, Open Graph tags and (home, contact) `Person` structured data; the browser
then hydrates the markup. `dist/index.html` stays the bare shell for `/` (language redirect) and
unknown paths (404). Page texts for search engines live under `meta` in the locale files.

The default share image `public/og-image.png` is generated by `node scripts/generate-og-image.mjs`
(re-run it after changing the brand or tagline).

## Environment variables

| Name            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `VITE_SITE_URL` | Public site URL (canonical links, sitemap, OG, hreflang). |

Never commit `.env`. Only `.env.example` is tracked.

## Deployment (Netlify)

Netlify builds every push to `main` and publishes it, and builds a preview of every pull request
(the link appears in the PR). The build itself is configured in the repo:

- `netlify.toml`: build command `npm run build`, publish folder `dist`. Node comes from `.nvmrc`.
- `public/_redirects`: clean URLs fall back to the SPA shell. `public/_headers`: security headers
  on every response, long caching of `/assets`. `scripts/serve-dist.mjs` mirrors both, and
  `scripts/serve-dist.test.mjs` fails if the two drift apart.
- Previews and branch deploys (`CONTEXT` other than `production`) are sent with
  `X-Robots-Tag: noindex` (`scripts/prerender.mjs`), so they never appear in search results.

### One-time setup in the Netlify panel

1. **Add new site → Import an existing project → GitHub**, pick this repository and allow the
   Netlify app access to it. Netlify reads the build settings from `netlify.toml`; leave the
   fields it pre-fills as they are.
2. **Site configuration → Site details → Change site name**: `masterpiecefigurinej`, so the
   site lives at `https://masterpiecefigurinej.netlify.app` (PLAN Z5.2).
3. **Site configuration → Environment variables → Add a variable**:
   `VITE_SITE_URL` = `https://masterpiecefigurinej.netlify.app` (all scopes and deploy contexts).
   Then **Deploys → Trigger deploy → Clear cache and deploy site**, so the build uses it.
4. **Site configuration → Build & deploy → Branches and deploy contexts**: production branch
   `main`; **Deploy Previews**: any pull request against your production branch; **Branch
   deploys**: none (only `main` is published).
5. **Forms**: after the first deploy, Netlify lists the `order` form (detected from the hidden copy
   in the HTML). Enable form detection if asked, then **Forms → Form notifications → Add
   notification → Email notification**: the address that should receive orders, form `order`.
6. Check the result: open the site, send a test order with a photo and a GIF, and make sure it
   arrives by e-mail (PLAN Z3.5).

Changing the domain later (PLAN Z5.2) needs no code change: update `VITE_SITE_URL` and redeploy.

## Contributing

Work on a branch (`feat/...`, `fix/...`, `test/...`, `chore/...`), use
[Conventional Commits](https://www.conventionalcommits.org/), and open a pull request into `main`.
Rules for Claude Code are in [`CLAUDE.md`](./CLAUDE.md).
