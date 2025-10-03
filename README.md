# Tic Tac Toe

A polished vanilla JavaScript implementation of Tic Tac Toe featuring score tracking,
keyboard play, accessible status updates, and configurable player names. The site is
entirely static and is designed to be deployed to GitHub Pages or any other static
hosting provider.

![Screenshot of the Tic Tac Toe board](https://github.com/Alex-Unnippillil/tictactoe/assets/24538548/15b4eda8-43c2-4f28-8fd5-593098a90799)

## Features

- 🎯 **Responsive board** rendered with semantic markup and accessible ARIA roles.
- 🧮 **Persistent scoreboard** that highlights winning lines and keeps a tally of wins.
- 🎛️ **Settings dialog** allowing custom player names that are stored in `localStorage`.
- ♿ **Keyboard support** with roving focus, arrow-key navigation, and live status updates.
- 📦 **Zero-build tooling** – everything runs in the browser with lightweight npm scripts for linting and tests.

## Project structure

```
├── assets/
│   ├── css/app.css        # Shared styles for the game UI
│   └── js/                # Status, settings, and game logic modules
├── site/                  # Supplemental static files (404 page, robots.txt, sitemap.xml)
├── tests/                 # Jest test suites
├── index.html             # Main application entry point
└── package.json
```

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start a static file server for local development:

   ```bash
   npm run serve
   ```

   The command uses [`http-server`](https://www.npmjs.com/package/http-server) to serve the repository root. Open the printed URL (defaults to `http://127.0.0.1:8080`).

3. Run the automated checks:

   ```bash
   npm run lint
   npm test
   ```

## Testing

- **Unit tests:** Implemented with Jest and JSDOM under `tests/unit`. Execute them with `npm test`.
- **Linting:** `npm run lint` runs ESLint with the recommended rule-set for browser scripts.

## Deployment

The project ships as static assets. Build steps are not required; deploy the repository
contents (including the `site/` directory) to your static host of choice. When using
GitHub Pages, ensure that `index.html` and the `assets/` directory are included in the
published branch. The supplemental files inside `site/` keep search engines happy.

## License

This project is licensed under the [MIT License](LICENSE).
