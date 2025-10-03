# tictactoe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

![image](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

SPDX-License-Identifier: MIT

![image](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)
https://alex-unnippillil.github.io/tictactoe/

## Static site assets

The `site/` directory contains supplemental static files such as `robots.txt` and `sitemap.xml`. Include this folder when publishing or deploying the site so search engines can access these resources.

## License

This project is licensed under the [MIT License](LICENSE).

# Tic Tac Toe

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

## Project Purpose

Tic Tac Toe is a tiny web project that demonstrates the full lifecycle of building, testing, and deploying a simple interactive game. It is intentionally lightweight, making it ideal for experimenting with static site hosting on GitHub Pages or for showcasing basic DOM manipulation with vanilla JavaScript.

## Quick Start

1. Install dependencies with `npm install`.
2. Launch the local development server with `npm run dev` and open the provided URL in your browser.
3. Make changes to `index.html`; the development server will automatically reload the page.

> **Prerequisites:** Node.js 18+ and npm 9+.

## Scripts

| Command            | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `npm run dev`      | Starts the local development server (aliases `npm run serve`).              |
| `npm run serve`    | Serves the static assets from `site/` at `http://localhost:4173`.           |
| `npm run lint`     | Runs Prettier in check mode across HTML, CSS, JS, JSON, and Markdown files. |
| `npm run lint:fix` | Formats files using Prettier.                                               |
| `npm run test`     | Placeholder script for future unit tests.                                   |
| `npm run e2e`      | Executes the Playwright end-to-end suite.                                   |
| `npm run deploy`   | Publishes the `dist/` output to GitHub Pages.                               |

## Local Development

- **Install dependencies:** `npm install`
- **Start the local server:** `npm run dev` (or `npm run serve` for additional flags)
- **Run lint checks while developing:** `npm run lint`
- **Format files when needed:** `npm run lint:fix`
- **Smoke-test end-to-end flows:** `npm run e2e` (with `npm run dev` running in another terminal)

## Testing

- **Unit tests:** `npm run test` (currently a placeholder until the unit suite is implemented).
- **Playwright end-to-end tests:** `npm run e2e` while `npm run dev` is serving the site locally. Install browsers with `npx playwright install` if prompted; HTML reports are generated in `playwright-report/` after each run.
- **Continuous integration:** See the workflows in `.github/workflows/` for CI and Pages deployment. Match failing jobs locally by running the same npm scripts reported in the workflow logs.

## Deployment Overview

1. Build the project locally with `npm run build` to generate optimized assets.
2. Preview the static bundle by serving the `dist/` directory locally if desired.
3. Deploy the latest build using `npm run deploy`, which pushes the generated content to the GitHub Pages branch.
4. GitHub Actions workflows automate deployment to ensure the published site stays in sync with the main branch.

## Architecture Overview

The project is a static HTML application comprised of:

- `index.html` containing the markup, inline styles, and JavaScript that power the entire game experience.
- No external build system is required; however, npm scripts provide scaffolding for future enhancements such as bundling or testing frameworks.

## GitHub Pages URL

> Placeholder: Update this section with the final published GitHub Pages link when available.

## License

SPDX-License-Identifier: MIT

A dedicated `LICENSE` file will be added to outline the full MIT license terms.
