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
There is no automated unit test suite yet. Please perform the manual checks below to ensure quality:

1. Open the site in the latest versions of Chrome, Firefox, and Safari (or an equivalent cross-browser testing tool) and verify game play, win detection, and reset logic.
2. Test on a narrow viewport (~320px) to confirm mobile responsiveness and touch support.
3. Use browser dev tools to confirm there are no console errors or 404 network requests.

If you add automated tests or E2E coverage in your change, document how to run them in your pull request description.

## Continuous integration & deployment

- Pull requests are validated by GitHub Actions CI. Ensure the Prettier check and any future lint/test workflows pass before requesting review. You can view the workflow status directly on the PR.
- Merges to `main` automatically trigger the GitHub Pages deployment pipeline. To keep deployments healthy, confirm that `index.html` and any assets you add load correctly when served from the repository root, and avoid introducing references to private or server-side resources.
- If a deployment fails, investigate the CI logs and open a follow-up PR with a fix or revert.

## Getting help

If you have questions, open a GitHub Discussion or issue describing what you are trying to accomplish. For urgent matters related to a failing deployment, please mention a maintainer in your pull request or issue so we can respond quickly.

We appreciate your contributions—thank you for helping improve Tic Tac Toe!
