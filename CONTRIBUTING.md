# Contributing to Tic Tac Toe

Thank you for your interest in improving this project! This document explains the expectations for contributors, from coding standards to local validation and deployment awareness. Please read it carefully before opening a pull request.

## Project overview

This repository hosts a lightweight, static Tic Tac Toe implementation that is published through GitHub Pages. The default branch is `main` and serves as both the source of truth for development and the deployment branch for the public site.

## How we work

### Branching strategy

- Create a topic branch from the latest `main` for every change. Follow the naming pattern `agent/<role>/<task-id>-short-title` described in [`AGENTS.md`](AGENTS.md) so that asynchronous contributors can see ownership at a glance. Examples: `agent/frontend-dev/14-highlight-win` or `agent/docs/30-export-settings-guide`.
- Keep branches focused on a single logical change and avoid combining unrelated updates in the same branch.
- Rebase your branch on top of `main` before opening or updating a pull request to reduce merge conflicts.

### Commit style

- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages (`feat: add responsive board layout`, `fix: correct hover styling`, etc.), matching the expectations documented in `AGENTS.md`.
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

Install dependencies once with:

```bash
npm install
```

Start a local development server from the project root:

```bash
npm run dev
```

This command proxies to `npm run serve`, which uses [`http-server`](https://www.npmjs.com/package/http-server) to serve the static assets from the `site/` directory. The server defaults to `http://localhost:4173` with caching disabled so changes are reflected immediately. You can pass additional flags to `npm run serve` if you need to tweak the behavior (for example, a different port).

### Linting and formatting

Use the provided npm scripts to keep the codebase consistent:

```bash
npm run lint      # Prettier check across HTML, CSS, JS, JSON, and Markdown files
npm run lint:fix  # Automatically format files when the check fails
```

These commands use the locally installed Prettier binary, so no global installation is required.

### Tests and end-to-end checks

Run automated checks before pushing to reduce CI churn:

```bash
npm run test  # Placeholder until unit tests are added
```

#### Playwright end-to-end tests

Keyboard accessibility and other flows are covered by Playwright specs under `tests/e2e/`. To execute them locally:

```bash
npm run e2e           # Run all Playwright specs
npx playwright install  # (one-time) install the browser binaries if prompted
```

By default the tests expect the site to be served at `http://localhost:4173`. Ensure `npm run dev` is running in another terminal before starting `npm run e2e`. Review the HTML reports generated in `playwright-report/` for detailed traces when failures occur.

Continue performing targeted manual checks—especially for new UI or accessibility work—while the unit test suite is being built out.

## Continuous integration & deployment

- Every pull request runs the `ci.yml` workflow, which in turn calls the lint, test, and Playwright commands. Wait for a green check mark before requesting review. A red ❌ indicates the failing job—expand the logs to identify the command that needs attention.
- The Pages badge in the README and the `pages.yml` workflow track the status of the `gh-pages` deployment. If `pages.yml` fails on `main`, prioritize a fix or revert so the public site stays healthy.
- When CI fails, reproduce the failing command locally (for example `npm run lint` or `npm run e2e`) before pushing additional commits. Capture insights or follow-up tasks in the pull request description.
- Merges to `main` automatically trigger the GitHub Pages deployment pipeline. Confirm that assets referenced in the site are relative URLs compatible with static hosting—no private APIs or server-side dependencies.

## Getting help

If you have questions, open a GitHub Discussion or issue describing what you are trying to accomplish. For urgent matters related to a failing deployment, please mention a maintainer in your pull request or issue so we can respond quickly.

We appreciate your contributions—thank you for helping improve Tic Tac Toe!
