# Tic Tac Toe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

A lightweight, framework-free Tic Tac Toe implementation that showcases how we test, ship, and operate a static site on GitHub Pages.

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

## Table of contents
- [Live demo](#live-demo)
- [Quick start](#quick-start)
- [Repository layout](#repository-layout)
- [Architecture overview](#architecture-overview)
- [Scripts](#scripts)
- [Testing](#testing)
- [Lighthouse audits](#lighthouse-audits)
- [Deployment overview](#deployment-overview)
- [Community guidelines](#community-guidelines)
- [Changelog](#changelog)
- [License](#license)

## Live demo
Visit the published site on GitHub Pages: **https://alex-unnippillil.github.io/tictactoe/**

## Quick start
1. Install dependencies with `npm install` (the project pins Node.js 20+ for tooling parity with CI).
2. Launch the local preview server with `npm run dev` and open the provided URL in your browser.
3. Make changes under `site/`; the static assets load instantly without a bundler.

> **Prerequisites:** Node.js 20+ and npm 9+.

## Repository layout
| Path | Purpose |
| --- | --- |
| `site/` | Production-ready HTML, CSS, and JavaScript for the game. `npm run dev` serves this directory locally, and the Pages workflow copies it into `dist/` for publication. |
| `site/js/` | Modular JavaScript split into `core/` (game constants), `state/` (shared state controllers such as `history.js`), `ui/` (DOM bindings for settings and status), plus optional AI and PWA helpers. These modules coordinate player input, persistence, and announcements. |
| `tests/` | Node-based unit tests that exercise the pure game logic. `npm run test` runs everything in this tree inside Node’s built-in test runner. |
| `.github/workflows/` | Automation pipelines. `ci.yml` runs the unit tests on every push, `lighthouse.yml` audits performance, and `pages.yml` mirrors the manual `npm run build` flow by copying `site/` into `dist/` before deploying to GitHub Pages so the live site stays up-to-date. |

Because the project ships pre-built assets, `npm run build` simply stages the `site/` directory into `dist/`—mirroring what the Pages workflow does before deploying. Deployment to GitHub Pages happens automatically, so you rarely need to run `npm run deploy` manually.

## Architecture overview
The game is organised around small browser modules that communicate through custom events:

1. `site/js/state/core.js` exposes `window.coreState`, the canonical source for player names. It normalises input, emits `state:*` events, and boots the rest of the app once it dispatches `core:ready`.
2. `site/js/state/history.js` attaches to `coreState`, keeps player metadata in sync with localStorage, and rebroadcasts updates as `history:*` events so features like the share payload and scoreboard can react without tight coupling.
3. UI bindings under `site/js/ui/` (for example `settings.js` and `status.js`) subscribe to both state channels. They manage focus, validation, and announcements so the DOM always reflects the latest state.
4. `site/js/game.js` ties everything together: it listens for board interactions, applies the core win-checking logic, persists progress, and asks the status module to narrate outcomes.

This event-driven flow keeps the board responsive while allowing new controllers—such as the optional AI helpers—to plug in without modifying the core DOM wiring. On every push to `main`, GitHub Actions runs the `ci.yml` workflow to verify the logic and the `pages.yml` workflow to publish the refreshed `dist/` bundle, keeping the public site continuously deployed.

For a deeper dive into the state synchronisation layer, see the inline documentation in [`site/js/state/history.js`](site/js/state/history.js).

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local static server (via `http-server`) so you can iterate on files inside `site/`. |
| `npm run build` | Copies `site/` into `dist/` to mirror the GitHub Pages packaging step. |
| `npm run test` | Executes the automated test suite located in `tests/`. |
| `npm run lint` | Placeholder script reserved for future lint rules. |
| `npm run deploy` | Bundled into the Pages workflow; manual runs are rarely needed because GitHub Actions publishes automatically. |

## Testing
- **Unit tests:** `npm run test`
- **Continuous integration:** See [`ci.yml`](.github/workflows/ci.yml) for the test pipeline and [`static.yml`](.github/workflows/static.yml) for additional static analysis jobs.

## Lighthouse audits
A dedicated [Lighthouse CI workflow](.github/workflows/lighthouse.yml) runs `npx lhci autorun` against the deployed GitHub Pages site at `https://alex-unnippillil.github.io/tictactoe/`. The job uploads the HTML report as an artifact named **`lighthouse-report`** so you can review the latest accessibility, performance, best practices, and SEO scores for the production build.

To inspect the results for any run:

1. Open the workflow run in GitHub Actions.
2. Scroll to the **Artifacts** section and download **`lighthouse-report`**.
3. Extract the archive locally and open `report.html` in your browser to view the full Lighthouse dashboard.

## Deployment overview
1. Build the project locally with `npm run build` to stage the `dist/` directory (or let the Pages workflow do this automatically).
2. Preview the static bundle by serving the `dist/` directory locally if desired.
3. GitHub Actions deploys the latest build through `.github/workflows/pages.yml` whenever changes land on `main`, ensuring the published site stays in sync.

## Community guidelines
We are committed to fostering a welcoming and inclusive environment. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) for expectations on community behavior and reporting. For details on how to get involved, see the [contribution guide](CONTRIBUTING.md).

## Changelog
Review the [CHANGELOG](CHANGELOG.md) for a curated list of notable updates to the project. Release announcements should link back to the same changelog entry to keep documentation and notes aligned.

## License
## Overview

Tic Tac Toe is a static web application that showcases a polished, accessible take on the classic game. The implementation uses vanilla JavaScript and persists game progress and player names in `localStorage` so you can leave and return without losing your history.

## Getting Started

> **Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local web server and open the printed URL:
   ```bash
   npm start
   ```
   The root page redirects straight to the interactive game located in the `site/` directory.
3. Stop the server at any time with `Ctrl+C`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Launches a static server that hosts the game from the `site/` directory. |
| `npm run serve` | Alias for `npm start` kept for compatibility. |
| `npm test` | Runs the Node.js test suite found in `tests/unit`. |
| `npm run lint` | Placeholder command – update it with your preferred linting setup. |
| `npm run e2e` | Placeholder command reserved for future end-to-end tests. |

## Project structure

- `index.html` – lightweight redirect that ensures GitHub Pages loads the interactive site instead of the repository README.
- `site/` – source of truth for the production-ready HTML, CSS, JavaScript, and supplemental static assets (`robots.txt`, `sitemap.xml`, etc.).
- `tests/` – unit tests for the underlying game logic.

## Community guidelines

We are committed to fostering a welcoming and inclusive environment. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) for expectations on community behavior and reporting. For details on how to get involved, see the [contribution guide](CONTRIBUTING.md).

See [docs/architecture/overview.md](docs/architecture/overview.md) for the latest module diagram, event flow, and deployment notes that explain how the browser scripts cooperate.

## License

This project is licensed under the [MIT License](LICENSE).
