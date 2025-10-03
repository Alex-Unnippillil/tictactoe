# Tic Tac Toe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

A polished, framework-free Tic Tac Toe experience that demonstrates how we build, test, and ship a static site with modern automation on GitHub Pages.

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

## Table of contents
- [Live demo](#live-demo)
- [Features at a glance](#features-at-a-glance)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture overview](#architecture-overview)
- [Testing & quality](#testing--quality)
- [Deployment](#deployment)
- [Documentation & community](#documentation--community)
- [License](#license)

## Live demo
Visit the published site on GitHub Pages: **https://alex-unnippillil.github.io/tictactoe/**

## Features at a glance
- **Vanilla stack:** No framework or bundler required—everything runs as plain HTML, CSS, and JavaScript.
- **Modular state management:** Browser modules coordinate game state, persistence, and UI updates through custom events.
- **Automated confidence:** Continuous integration runs unit tests and Lighthouse audits on every push.
- **Pages-first workflow:** The repository is tuned for GitHub Pages, keeping the live site in sync with `main` automatically.

## Quick start
> **Prerequisites:** Node.js 20+ and npm 9+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the local preview server (serves the `site/` directory) and open the printed URL in your browser:
   ```bash
   npm run dev
   ```
3. Run the automated tests whenever you change core logic:
   ```bash
   npm run test
   ```
4. When you are ready to stage a production bundle locally, run:
   ```bash
   npm run build
   ```

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Starts a local static server (via `http-server`) to iterate on files inside `site/`. |
| `npm run serve` | Direct alias for `npm run dev`. |
| `npm run build` | Packages the `site/` directory into `dist/`, mirroring the GitHub Pages workflow. |
| `npm run deploy` | Convenience alias for the build step; Pages runs it automatically on `main`. |
| `npm run test` | Executes the Node.js unit tests located under `tests/unit`. |
| `npm run lint` | Placeholder for custom lint rules (currently prints a notice). |
| `npm run e2e` | Reserved for future end-to-end tests (currently prints a notice). |

## Project structure
| Path | Purpose |
| --- | --- |
| `index.html` | Lightweight redirect that ensures GitHub Pages loads the interactive site from `site/`. |
| `site/` | Source of truth for production-ready HTML, CSS, JavaScript, and supporting static assets. |
| `site/js/` | Modular JavaScript split into `core/`, `state/`, and `ui/` folders for configuration, persistence, and DOM bindings. |
| `tests/` | Node-based unit tests that exercise the pure game logic. |
| `.github/workflows/` | Automation pipelines for CI, Lighthouse audits, and GitHub Pages deployment. |
| `scripts/` | Local helper utilities such as the build script used by automation. |

## Architecture overview
The browser code favours small, composable modules that communicate via custom DOM events:

1. `site/js/state/core.js` exposes `window.coreState`, the canonical source for player names and configuration. It emits `state:*` events and boots the rest of the app after dispatching `core:ready`.
2. `site/js/state/history.js` subscribes to `coreState`, keeps player metadata in sync with `localStorage`, and rebroadcasts updates as `history:*` events for loosely coupled consumers like the scoreboard and share payload logic.
3. Modules under `site/js/ui/` (for example `settings.js` and `status.js`) listen to both state channels. They manage focus, validation, and status announcements so the DOM remains accurate and accessible.
4. `site/js/game.js` orchestrates board interactions, applies the win-checking logic, persists progress, and requests status updates when the game ends.

This event-driven design keeps the board responsive, isolates side effects, and makes it straightforward to add new controllers—such as AI helpers—without rewiring the UI.

## Testing & quality
- **Unit tests:** `npm run test`
- **Continuous integration:** [`ci.yml`](.github/workflows/ci.yml) runs the Node.js test suite on every push.
- **Lighthouse audits:** [`lighthouse.yml`](.github/workflows/lighthouse.yml) executes `npx lhci autorun` against the deployed site and publishes the HTML report as the `lighthouse-report` artifact.

## Deployment
1. Build the project locally with `npm run build` if you need a copy of the `dist/` bundle.
2. GitHub Actions uses `.github/workflows/pages.yml` to publish the latest build to GitHub Pages whenever changes land on `main`.
3. The Pages workflow mirrors the manual build process, copying `site/` into `dist/` before deploying so the public site stays current.

## Documentation & community
- Read the [architecture overview](docs/architecture/overview.md) for diagrams and deeper implementation details.
- Review our [Code of Conduct](CODE_OF_CONDUCT.md) and [contribution guide](CONTRIBUTING.md) before opening issues or pull requests.
- Track notable updates in the [changelog](CHANGELOG.md).

## License
This project is licensed under the [MIT License](LICENSE).
