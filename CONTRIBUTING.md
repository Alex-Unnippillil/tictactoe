# Contributing to Tic Tac Toe

Thank you for your interest in improving this project! This document explains the expectations for contributors, from coding standards to local validation and deployment awareness. Please read it carefully before opening a pull request.

All participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Project overview

This repository hosts a lightweight, static Tic Tac Toe implementation that is published through GitHub Pages. The default branch is `main` and serves as both the source of truth for development and the deployment branch for the public site.

## How we work

### Branching strategy
- Create a topic branch from the latest `main` for every change. Use short, descriptive names such as `feature/add-scoreboard`, `bugfix/fix-mobile-layout`, or `docs/update-readme`.
- Keep branches focused on a single logical change. Avoid combining unrelated updates in the same branch.
- Rebase your branch on top of `main` before opening or updating a pull request to reduce merge conflicts.

### Commit style
- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages (`feat: add responsive board layout`, `fix: correct hover styling`, etc.).
- Write atomic commits that capture a coherent piece of work. Avoid “WIP” commits; squash locally when necessary.
- Include context in the body when the subject line alone is insufficient. Reference related issues using `Fixes #123` when appropriate.

### Pull requests
- Provide a concise summary of the change, screenshots or GIFs for UI updates, and testing notes describing how you validated the change locally.
- Ensure your branch is up to date with `main` and that all required checks are passing before requesting review.
- Draft pull requests are welcome while work is in progress—convert to “Ready for review” once you have completed the checklist.

## Coding standards

This project is built with vanilla HTML, CSS, and JavaScript. Please adhere to the following conventions:

- **HTML**: Use semantic elements where possible (`<main>`, `<section>`, `<button>`). Keep markup accessible by including ARIA roles only when necessary and ensuring interactive elements are focusable.
- **CSS**: Prefer component-scoped selectors and avoid overly specific rules. Follow a consistent naming scheme such as BEM (`.board__cell--active`). Group related properties and keep inline styles minimal.
- **JavaScript**: Stick to ES6+ syntax supported by evergreen browsers. Keep the codebase framework-free, modular, and free of unnecessary dependencies.
- **Accessibility & responsiveness**: Test changes across different viewport sizes and ensure keyboard operability and color contrast remain acceptable.
- **Formatting**: Use two-space indentation and ensure files end with a newline. Run the formatting/lint commands described below before committing.

## Local development workflow

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer (for linting/formatting commands).
- A modern web browser for manual testing.

### Running the site locally
Because this is a static site, the simplest approach is to open `index.html` directly in your browser. If you prefer a local server (recommended for accurate GitHub Pages parity), you can run:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

### Linting and formatting
Editor defaults are captured in the repository's [`.editorconfig`](./.editorconfig), which enforces UTF-8 encoding, LF line endings, final newlines, and two-space indentation for web assets and config files. Most modern editors detect this automatically.

Run the following commands from the project root before committing:

```bash
npx prettier --check "**/*.{html,css,js}"
```

If the check fails, format the files automatically:

```bash
npx prettier --write "**/*.{html,css,js}"
```

Feel free to add a `.prettierrc` file in a separate pull request if you need custom rules.

### Tests and end-to-end checks

The repository ships with automated coverage that you are expected to keep green:

- **Unit tests (`tests/unit/`)** – These run with Node's built-in test runner via Jest-style specs. The current suite covers the AI decision tree (`ai.spec.js`), move history helpers (`history.test.js`), and the opening move heuristics (`minimax-first-move.test.js`). Execute all unit tests locally with:

  ```bash
  npm run test
  ```

  Run the suite whenever you touch the game engine, history persistence, or add new logic that should be regression-proof. Add new `.test.js`/`.spec.js` files alongside the existing ones in `tests/unit/` so CI picks them up automatically.

- **Playwright E2E scaffolding (`tests/e2e/`)** – There is a starter spec, `keyboard.spec.ts`, that exercises keyboard navigation and announcements. It expects the static site to be served locally (for example with `npm run serve`). When you introduce new interaction flows, extend this directory with additional Playwright specs and wire up the `npm run e2e`/`npm run e2e:ci` scripts as needed so contributors and CI can execute them consistently.

If you add new automated checks, update this section with instructions and ensure they are runnable without extra secrets or services.

## Continuous integration & deployment

- Pull requests are validated by [`.github/workflows/ci.yml`](.github/workflows/ci.yml). That workflow installs dependencies, runs `npm test`, and expects an `npm run e2e:ci` command to exercise the Playwright specs. Keep your local workflow aligned with those steps so what passes locally mirrors CI.
- Merges to `main` automatically trigger the GitHub Pages deployment pipeline. To keep deployments healthy, confirm that `index.html` and any assets you add load correctly when served from the repository root, and avoid introducing references to private or server-side resources.
- If a deployment fails, investigate the CI logs and open a follow-up PR with a fix or revert.

## Getting help

If you have questions, open a GitHub Discussion or issue describing what you are trying to accomplish. For urgent matters related to a failing deployment, please mention a maintainer in your pull request or issue so we can respond quickly.

We appreciate your contributions—thank you for helping improve Tic Tac Toe!
