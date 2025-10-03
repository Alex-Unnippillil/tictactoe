# tictactoe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

https://alex-unnippillil.github.io/tictactoe/

## Static site assets

The `site/` directory contains supplemental static files such as `robots.txt` and `sitemap.xml`. Include this folder when publishing or deploying the site so search engines can access these resources.
## Project Purpose

Tic Tac Toe is a tiny web project that demonstrates the full lifecycle of building, testing, and deploying a simple interactive game. It is intentionally lightweight, making it ideal for experimenting with static site hosting on GitHub Pages or for showcasing basic DOM manipulation with vanilla JavaScript.

## Quick Start

1. Install dependencies (none are required, but `npm install` will ensure the lockfile is honored).
2. Serve the static site locally with `npm run serve`.
3. Open the reported URL (defaults to `http://127.0.0.1:8080`) to interact with the game.

> **Prerequisites:** Node.js 18+ and npm 9+ to run the bundled scripts.

## Scripts

| Command | Description |
| --- | --- |
| `npm run serve` | Starts a local static file server for the contents of `site/`.
| `npm run lint` | Placeholder script that currently reports linting is not configured.
| `npm run test` | Placeholder script that notes unit tests are not yet configured.
| `npm run e2e` | Placeholder script indicating end-to-end tests are not yet configured.

## Local Development

- **Serve the static files:** `npm run serve`
- **Check placeholder scripts:** `npm run lint`, `npm run test`, or `npm run e2e`

## Testing

- **Placeholder unit tests:** `npm run test`
- **Placeholder end-to-end tests:** `npm run e2e`
- **Continuous integration:** See the workflows in `.github/workflows/` for Pages deployment.

## Deployment Overview

1. Update the static assets inside the `site/` directory as needed.
2. Preview changes locally with `npm run serve`.
3. Push commits to `main`; GitHub Actions publishes the `site/` contents to the `gh-pages` branch automatically.

## Architecture Overview

The project is a static HTML application comprised of:

- `index.html` containing the markup, inline styles, and JavaScript that power the entire game experience.
- No external build system is required; however, npm scripts provide scaffolding for future enhancements such as bundling or testing frameworks.

## GitHub Pages URL

The latest build is always available at [alex-unnippillil.github.io/tictactoe](https://alex-unnippillil.github.io/tictactoe/).

## License

This project is distributed under the MIT License; see the [LICENSE](LICENSE) file for details.
