# tictactoe

[![CI Status](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/ci.yml?branch=main&label=CI)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/ci.yml)
[![Pages Deployment](https://img.shields.io/github/actions/workflow/status/Alex-Unnippillil/tictactoe/pages.yml?branch=main&label=Pages)](https://github.com/Alex-Unnippillil/tictactoe/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Live Demo

Visit the published site on GitHub Pages: **https://alex-unnippillil.github.io/tictactoe/**

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

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

## License

This project is licensed under the [MIT License](LICENSE).
