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
npm run dev
```

## Scripts

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start the Vite dev server                  |
| `npm run build`        | Type-check and build for production        |
| `npm run preview`      | Serve the production build locally         |
| `npm run lint`         | Run ESLint                                 |
| `npm run lint:fix`     | Run ESLint and auto-fix what it can        |
| `npm run typecheck`    | Run the TypeScript compiler without output |
| `npm run format`       | Format all files with Prettier             |
| `npm run format:check` | Check formatting without writing           |

## Environment variables

| Name            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `VITE_SITE_URL` | Public site URL (canonical links, sitemap, OG, hreflang). |

Never commit `.env`. Only `.env.example` is tracked.

## Contributing

Work on a branch (`feat/...`, `fix/...`, `test/...`, `chore/...`), use
[Conventional Commits](https://www.conventionalcommits.org/), and open a pull request into `main`.
Rules for Claude Code are in [`CLAUDE.md`](./CLAUDE.md).
