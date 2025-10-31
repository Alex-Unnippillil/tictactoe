# Tic Tac Toe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

A polished, framework-free implementation of the classic Tic Tac Toe game. The project highlights how to run a maintainable static site on GitHub Pages while keeping the experience accessible, performant, and easy to extend.

<img width="1119" height="1188" alt="image" src="https://github.com/user-attachments/assets/319548fb-0e86-4e5f-a039-0b828accc099" />


## Table of contents
- [Live demo](#live-demo)
- [Key features](#key-features)
- [Gameplay overview](#gameplay-overview)
- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Project scripts](#project-scripts)
- [Repository layout](#repository-layout)
- [Architecture overview](#architecture-overview)
- [Accessibility and UX commitments](#accessibility-and-ux-commitments)
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
- Built-in scorekeeping, rematch controls, and round management for quick series play.
- Separation of state, UI bindings, and game logic to keep future feature work modular.

## Gameplay overview
The live app is structured to make every round easy to follow:

- **Scoreboard and avatars:** The header and scoreboard components highlight each player’s mark, preferred name, and running win total. The game persists those scores between sessions so multi-round rivalries can continue even after a browser refresh.
- **Board interactions:** Nine focusable buttons form the grid. Labels adapt as players place pieces, keeping screen reader users informed while reinforcing legal move hints for sighted players.
- **Round controls:** Dedicated actions allow competitors to start a new round, reset the active board, or clear cumulative scores without reloading the page. Win detection highlights the finishing line and locks further moves until a new round starts.
- **Settings integration:** Auxiliary UI modules (see `site/js/ui/`) listen for state changes to handle preferences such as player names and to broadcast announcements to the shared status area.

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

## Development workflow
- Follow Conventional Commit semantics (`type(scope): summary`) so that automated changelog tooling can infer history cleanly.
- Branch naming typically follows `agent/<role>/<task-id>-short-title` to align with the asynchronous workflow documented in [AGENTS.md](AGENTS.md).
- Run `npm run test` after each major change to confirm the game engine and helpers remain stable, and keep documentation (`README.md`, `docs/`) in sync with UI updates.
- When contributing UI work, capture screenshots or short screen recordings in PRs to support the QA and accessibility review cycle described in the project’s contributor guides.

## Project scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Serves the contents of `site/` locally using `http-server`. |
| `npm run build` | Copies `site/` into `dist/`, mirroring the GitHub Pages packaging step. |
| `npm run test` | Executes the Node-based unit tests located in `tests/`. |
| `npm run e2e` | Placeholder stub for end-to-end tests; currently prints a status message. |
| `npm run e2e:ci` | CI alias that proxies to `npm run e2e` so the workflow succeeds until real tests ship. |
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

## Accessibility and UX commitments
- **Semantic structure:** The board exposes `role="grid"`, while each cell is a button with precise `aria-label` updates so assistive technology announces the latest move context.
- **Live status messaging:** The region identified by `#statusMessage` uses `aria-live="polite"` to announce turn changes, wins, and draw states without stealing focus.
- **Keyboard and focus management:** All interactive elements are reachable using the keyboard alone. Visual focus indicators and reflow-friendly layout styles maintain clarity on small and large screens alike.
- **Reduced-risk persistence:** Storage reads and writes are wrapped in guards to avoid throwing in browsers where `localStorage` is unavailable, protecting the experience for privacy-focused users.

## Testing and quality
- **Unit tests:** `npm run test` runs the Node-based suite under `tests/`.
- **Continuous integration:** [`ci.yml`](.github/workflows/ci.yml) validates every push, and [`static.yml`](.github/workflows/static.yml) is reserved for additional static analysis.
- **Lighthouse audits:** [`lighthouse.yml`](.github/workflows/lighthouse.yml) executes `npx lhci autorun` against the deployed site, publishing an artifact named **`lighthouse-report`** with the latest performance, accessibility, best-practices, and SEO scores.
- **Manual smoke testing:** Validate local changes in `npm run dev` by playing through win, draw, and reset paths to ensure focus states, narration, and persistence continue to behave as documented.

## Deployment
1. Build the distributable bundle with `npm run build` (or rely on the automated Pages workflow).
2. Optionally serve `dist/` locally to verify the static output.
3. Push to `main` to trigger `.github/workflows/pages.yml`, which runs `npm run build` to populate `dist/` before deploying it to GitHub Pages automatically.

## Documentation and support
- Review the [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guide](CONTRIBUTING.md) for expectations and onboarding details.
- Consult [docs/architecture/overview.md](docs/architecture/overview.md) for diagrams and deeper technical context.
- Track notable updates in the [CHANGELOG](CHANGELOG.md).

## License
This project is licensed under the [MIT License](LICENSE).
<img width="1000" height="1318" alt="image" src="https://github.com/user-attachments/assets/f83d8743-8b3a-4de9-b3e1-806dbd5bd142" />

