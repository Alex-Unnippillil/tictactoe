# Tic Tac Toe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

A polished, framework-free implementation of the classic Tic Tac Toe game. The project highlights how to run a maintainable static site on GitHub Pages while keeping the experience accessible, performant, and easy to extend.

![Screenshot of the Tic Tac Toe board](<img width="1119" height="1188" alt="image" src="https://github.com/user-attachments/assets/23d9dfb9-ce26-4dc5-b9af-997d7f7c9abb" />
)

## Table of contents
- [Live demo](#live-demo)
- [Key features](#key-features)
- [Getting started](#getting-started)
- [Project scripts](#project-scripts)
- [Repository layout](#repository-layout)
- [Architecture overview](#architecture-overview)
- [Testing and quality](#testing-and-quality)
- [Deployment](#deployment)
- [Documentation and support](#documentation-and-support)
- [License](#license)

## Live demo
Explore the production build on GitHub Pages: **https://alex-unnippillil.github.io/tictactoe/**

## Key features
- Fast, framework-free gameplay rendered with vanilla JavaScript, HTML, and CSS.
- Persistent player names and match history via `localStorage`.
- Accessible status updates, keyboard navigation, and win-state announcements.
- Automated CI, Lighthouse performance checks, and Pages deployments.

## Getting started
> **Prerequisites:** Node.js 20+ and npm 9+ (aligned with the CI environment).

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local preview server and open the logged URL:
   ```bash
   npm run dev
   ```
   Changes inside `site/` hot-reload instantly while you iterate.
3. When you are ready to publish locally, build the static bundle:
   ```bash
   npm run build
   ```

## Project scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Serves the contents of `site/` locally using `http-server`. |
| `npm run build` | Copies `site/` into `dist/`, mirroring the GitHub Pages packaging step. |
| `npm run test` | Executes the Node-based unit tests located in `tests/`. |
| `npm run lint` | Reserved for future lint rules (no-op today). |
| `npm run deploy` | Matches the Pages workflow for manual deployments when needed. |

## Repository layout
| Path | Purpose |
| --- | --- |
| `site/` | Production-ready HTML, CSS, JavaScript, and supporting assets for the live game. |
| `site/js/` | Modular JavaScript organised into `core/`, `state/`, and `ui/` folders so game logic, persistence, and DOM bindings remain decoupled. |
| `tests/` | Unit tests that exercise pure game logic using Node’s built-in test runner. |
| `.github/workflows/` | Automation pipelines for CI (`ci.yml`), Lighthouse audits (`lighthouse.yml`), and GitHub Pages deployments (`pages.yml`). |

## Architecture overview
The browser experience is assembled from small event-driven modules:

1. `site/js/state/core.js` maintains canonical player data, dispatches `state:*` events, and signals readiness via `core:ready`.
2. `site/js/state/history.js` syncs with `coreState`, persists updates to `localStorage`, and rebroadcasts `history:*` events so ancillary features stay in sync without tight coupling.
3. UI bindings in `site/js/ui/` (for example, `settings.js` and `status.js`) subscribe to both channels to manage focus, validation, and announcements.
4. `site/js/game.js` coordinates board interactions, win detection, persistence, and narration.

This modular structure keeps the board responsive, enables drop-in enhancements (such as AI helpers), and keeps rendering logic isolated from game rules.

## Testing and quality
- **Unit tests:** `npm run test` runs the Node-based suite under `tests/`.
- **Continuous integration:** [`ci.yml`](.github/workflows/ci.yml) validates every push, and [`static.yml`](.github/workflows/static.yml) is reserved for additional static analysis.
- **Lighthouse audits:** [`lighthouse.yml`](.github/workflows/lighthouse.yml) executes `npx lhci autorun` against the deployed site, publishing an artifact named **`lighthouse-report`** with the latest performance, accessibility, best-practices, and SEO scores.

## Deployment
1. Build the distributable bundle with `npm run build` (or rely on the automated Pages workflow).
2. Optionally serve `dist/` locally to verify the static output.
3. Push to `main` to trigger `.github/workflows/pages.yml`, which stages `dist/` and deploys it to GitHub Pages automatically.

## Documentation and support
- Review the [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guide](CONTRIBUTING.md) for expectations and onboarding details.
- Consult [docs/architecture/overview.md](docs/architecture/overview.md) for diagrams and deeper technical context.
- Track notable updates in the [CHANGELOG](CHANGELOG.md).

## License
This project is licensed under the [MIT License](LICENSE).
