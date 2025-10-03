# tictactoe

SPDX-License-Identifier: MIT

![image](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)
https://alex-unnippillil.github.io/tictactoe/

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
