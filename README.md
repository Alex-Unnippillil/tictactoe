# tictactoe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Live Demo

Visit the published site on GitHub Pages: **https://alex-unnippillil.github.io/tictactoe/**

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

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

## Community guidelines

We are committed to fostering a welcoming and inclusive environment. Please
review our [Code of Conduct](CODE_OF_CONDUCT.md) for expectations on community
behavior and reporting. For details on how to get involved, see the
[contribution guide](CONTRIBUTING.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server for iterative work.
| `npm run build` | Produces the production-ready static assets.
| `npm run test` | Executes the automated test suite.
| `npm run lint` | Runs linting to ensure code quality and consistency.
| `npm run deploy` | Publishes the `dist/` output to GitHub Pages.

## Local Development

- **Start a hot-reloading server:** `npm run dev`
- **Run linters while developing:** `npm run lint`
- **Format and lint before committing:** `npm run lint && npm run test`

## Testing

- **Unit tests:** `npm run test`
- **Continuous integration:** See the workflows in `.github/workflows/` for Pages deployment.

## Lighthouse audits

A dedicated [Lighthouse CI workflow](.github/workflows/lighthouse.yml) runs `npx lhci autorun` against the deployed GitHub Pages site at `https://alex-unnippillil.github.io/tictactoe/`. The job uploads the HTML report as an artifact named **`lighthouse-report`** so you can review the latest accessibility, performance, best practices, and SEO scores for the production build.

To inspect the results for any run:

1. Open the workflow run in GitHub Actions.
2. Scroll to the **Artifacts** section and download **`lighthouse-report`**.
3. Extract the archive locally and open `report.html` in your browser to view the full Lighthouse dashboard.

## Deployment Overview

1. Build the project locally with `npm run build` to generate optimized assets.
2. Preview the static bundle by serving the `dist/` directory locally if desired.
3. Deploy the latest build using `npm run deploy`, which pushes the generated content to the GitHub Pages branch.
4. GitHub Actions workflows automate deployment to ensure the published site stays in sync with the main branch.

## Changelog

Review the [CHANGELOG](CHANGELOG.md) for a curated list of notable updates to the project. Release announcements should link back to the same changelog entry to keep documentation and notes aligned.

## Architecture Overview

The project is a static HTML application comprised of:

- `index.html` containing the markup, inline styles, and JavaScript that power the entire game experience.
- No external build system is required; however, npm scripts provide scaffolding for future enhancements such as bundling or testing frameworks.

See [docs/architecture/overview.md](docs/architecture/overview.md) for the latest module diagram, event flow, and deployment notes that explain how the browser scripts cooperate.

## License

SPDX-License-Identifier: MIT
