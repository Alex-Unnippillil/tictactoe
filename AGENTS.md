# AGENTS.md

Author: Project Maintainers
Audience: Human contributors and AI coding agents
Scope: Entire repository

---

## Repository snapshot
- The playable experience lives in `site/`. `site/index.html` renders the scoreboard, modal settings form, and accessible grid shown in production. Keep the root `index.html` in sync; it simply points at the same assets with a `<base>` tag so GitHub Pages serves the game from `/`.
- `site/js/game.js` is the central controller. It persists board state and scores to `localStorage`, broadcasts status updates, and drives the DOM bindings for the nine interactive cells.
- Shared state lives in `site/js/state/` (`core.js` and `history.js`) while UI helpers are split across `site/js/ui/` (status announcements, settings modal, theming effects) and `site/js/pwa/install.js` for the optional install prompt. The minimax AI is exposed from `site/js/ai/minimax.js` and is covered by the unit tests in `tests/unit/`.
- Documentation such as `docs/architecture/overview.md`, `README.md`, and `CONTRIBUTING.md` must stay aligned with code changes. Update them whenever module responsibilities or required tooling changes.

## Local development and build
- Use Node.js 20 or newer. Install dependencies with `npm install`.
- `npm run dev` (alias for `npm run serve`) starts `http-server` against `site/` so you can exercise the same bundle GitHub Pages serves. `npm run build` copies `site/` into `dist/` using `scripts/build.mjs` — this is the artifact deployed by `.github/workflows/pages.yml`.
- Run `npm test` to execute the Node-based unit suite (`tests/unit/`). For end-to-end coverage, start the local server and run `npx playwright test` to exercise `tests/e2e/keyboard.spec.ts` until the `npm run e2e` script is wired up to the real Playwright runner.

## Code expectations
- Stay framework-free. Keep logic modular by extending the existing controller/state/UI split rather than introducing global variables or tightly coupling DOM access.
- Preserve accessibility guarantees: the grid buttons, live region status messages, and settings dialog focus management are integral to the experience. Mirror existing ARIA usage and keyboard handling patterns found in the current modules when adding UI.
- Follow the two-space indentation and Prettier formatting used across HTML, CSS, and JS. Prefer pure functions for new game logic so it can be covered in `tests/unit/`.

## PR and review checklist
- Branch naming can follow `feature/...` or `fix/...`, and commits should use Conventional Commit prefixes.
- Include screenshots or short clips for any visual change and list manual test steps in the PR body. Update relevant documentation pages alongside code changes.
- Before requesting review, run:
  - `npm run build`
  - `npm test`
  - `npx playwright test` (until the dedicated npm script is connected)
  - `npx prettier --check "**/*.{html,css,js}"`
  Fix any failures before submitting.

## Near-term focus items
Prioritise these improvements identified during the latest code review:
1. Replace the placeholder `npm run e2e` script with an actual Playwright command so `.github/workflows/ci.yml` can run the keyboard regression headlessly. The suite already lives in `tests/e2e/keyboard.spec.ts`; only the package script currently echoes a stub.
2. Configure ESLint using the existing dependency in `package.json` and point `npm run lint` at it instead of logging "No lint script configured". This will catch accidental regressions in modules such as `site/js/ui/settings.js` and `site/js/game.js` before they reach review.
3. Align documentation on required tooling (for example, Node.js 20+) and capture instructions for running the Playwright checks so contributors do not rely on outdated prerequisites.
4. Extend automated coverage for the PWA install helper (`site/js/pwa/install.js`) or appearance settings workflow to guard against regressions in the dynamic button injection and `localStorage` persistence paths.

Always update this guide when the workflow or structure changes so future batches inherit an accurate starting point.
