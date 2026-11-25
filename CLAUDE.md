# MasterpieceFigurineJ – rules for Claude

Portfolio site for Julia, a figurine and painting artist. The full plan, task list and
decisions live in `PLAN.md` (written in Polish). All code, comments, commits and docs are in English.
When `PLAN.md` and this file disagree, `PLAN.md` wins.

## Tech stack

- React 19 + TypeScript 6 (strict) + Vite, single-page app
- Package manager: npm
- Styling: CSS Modules + CSS custom properties (design tokens)
- Routing: React Router with a language prefix (`/pl/...`, `/en/...`)
- i18n: react-i18next, `src/locales/pl.json` and `en.json`
- Forms: react-hook-form + zod
- Testing: Vitest + React Testing Library + user-event, MSW, Playwright + @axe-core/playwright
- Linting/formatting: ESLint + Prettier

## Code conventions

- Function components and hooks only; no class components
- One component per file, PascalCase file names (e.g. `WorkCard.tsx`)
- Folder layout (see `PLAN.md` §6): `src/components`, `src/pages`, `src/config`, `src/content`,
  `src/lib`, `src/locales`, `src/styles`, `src/test`
- Strict TypeScript: no `any` unless justified in a comment
- Keep components small; extract logic into custom hooks when it grows
- All user-visible text goes into `pl.json` and `en.json`; never hard-code UI strings in components
- Unit/component tests live next to the file they test (`*.test.ts(x)`); e2e tests live in `/e2e`

## Workflow

1. Before starting a task, read `PLAN.md`; tick the task off when it is done.
2. Before larger changes, briefly explain the plan and wait for approval.
3. Every task gets its own branch and ends with a pull request.
4. Every new component or function has tests. A task without tests is not done.
5. Before committing, run `npm run lint && npm run typecheck && npm run test`.
6. Libraries listed in `PLAN.md` §4 are approved. Any other new dependency: ask first and
   justify it in the pull request description.
7. Never commit secrets; use `.env` (gitignored) and keep `.env.example` up to date.

## Git & GitHub

- The repository is private.
- Never push to `main` directly; work on branches named `feat/z1-5-turntable`, `fix/...`,
  `test/...`, `chore/...`
- Use Conventional Commits (`feat(portfolio): add tag filter`, `test(form): ...`, `chore: ...`)
- Small, focused commits; ask before pushing or opening a PR
- Never force-push or rewrite history without asking

## Communication

- Keep answers concise; explain _why_ for non-obvious decisions
- If requirements are unclear, ask instead of guessing
