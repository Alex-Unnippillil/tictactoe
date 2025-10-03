# AGENTS.md

Author: Project Maintainers  
Audience: Human contributors and AI coding agents working asynchronously in batches  
Scope: TicTacToe game hosted entirely on GitHub Pages with no secrets required

---

## 1. Purpose
This document defines a clear, repeatable workflow for multiple agents to work asynchronously on the TicTacToe repository and ship a polished, reliable game on GitHub Pages. It includes agent roles, handoffs, acceptance criteria, CI configuration, coding standards, security and privacy guardrails, batch planning, and a numbered backlog that agents can execute in order.

## 2. Hosting model and repo layout
- Hosting: GitHub Pages only. No server or secrets. Static assets only.
- Two-branch model:
  - `main`: source of truth for development.
  - `gh-pages`: published site. Auto-deployed by GitHub Actions.
- Pages output directory: `./dist` if a build step exists, otherwise repository root. Agents must keep the Pages workflow consistent with the selected approach.
- Minimum required files:
  - `index.html` at repo root or inside `dist` after build
  - `assets/` for CSS, images, and JS modules
  - `favicon.ico` and `site.webmanifest` if PWA tasks are implemented later

> If the current repository is already structured differently, prefer non-breaking incremental changes. Do not move files without a migration step and a PR review.

## 3. Agent roster
Each agent has triggers, inputs, deliverables, labels, and exit criteria. The same person or service can act as multiple agents.

### 3.1 Product Owner Agent
- Triggers: New milestone, scope questions, backlog grooming windows.
- Inputs: User feedback, GitHub Discussions, Issues.
- Deliverables: Prioritized backlog with acceptance criteria, batch plans.
- Labels: `type:product`, `priority:P1|P2|P3`.
- Exit criteria: Batch plan published and issues labeled.

### 3.2 Planner Agent
- Triggers: Start of a batch window.
- Inputs: Backlog, open PRs, CI status.
- Deliverables: Batch plan `BATCH-<n>.md`, assignments per agent, risk notes.
- Labels: `batch:<n>`, `needs:dev`, `needs:review`.
- Exit criteria: All batch issues linked and scoped.

### 3.3 Architect Agent
- Triggers: New capability or refactor.
- Inputs: Current layout, performance snapshots, a11y audit.
- Deliverables: ADRs in `docs/adr/NNN-title.md`, updated diagrams.
- Labels: `type:arch`, `impact:high`.
- Exit criteria: ADR merged and referenced by tasks.

### 3.4 Frontend Dev Agent
- Triggers: Issues labeled `needs:dev`.
- Inputs: Designs, ADRs, coding standards.
- Deliverables: Code changes with tests, updated docs, PR.
- Labels: `type:feature` or `type:bug`.
- Exit criteria: CI green, reviewer sign-off, a11y pass.

### 3.5 Game Engine Dev Agent
- Triggers: Engine or AI work.
- Inputs: Board model, rules, test vectors.
- Deliverables: Pure functions for rules, win detection, AI opponent.
- Labels: `type:engine`.
- Exit criteria: Unit tests >95 percent coverage on engine modules.

### 3.6 QA Agent
- Triggers: PR opened, release candidate build.
- Inputs: Test plan, CI output, Playwright traces if configured.
- Deliverables: Test results, bug reports with repro steps, screenshots.
- Labels: `qa:pass`, `qa:blocker`, `qa:needs-fix`.
- Exit criteria: All P1 bugs resolved or waived by Product Owner.

### 3.7 Accessibility Agent
- Triggers: UI change or new component.
- Inputs: Axe reports, manual keyboard pass, screen reader notes.
- Deliverables: a11y report, patches for ARIA roles and focus order.
- Labels: `type:a11y`.
- Exit criteria: WCAG 2.1 AA equivalent checks pass on main screens.

### 3.8 UX Design Agent
- Triggers: New flow or layout change.
- Inputs: User feedback and product goals.
- Deliverables: Wireframes in `docs/ux/`, updated style tokens.
- Labels: `type:design`.
- Exit criteria: Approved wireframes linked in PR.

### 3.9 Localization Agent
- Triggers: Text changes or new languages.
- Inputs: `i18n/*.json` catalogs.
- Deliverables: Translations, RTL checks, locale switcher verification.
- Labels: `type:i18n`.
- Exit criteria: Language toggles functional with no layout breaks.

### 3.10 Docs Agent
- Triggers: New feature or onboarding update.
- Inputs: PR diffs and ADRs.
- Deliverables: `README.md` and `AGENTS.md` updates, guides in `docs/`.
- Labels: `type:docs`.
- Exit criteria: New features documented with screenshots.

### 3.11 Release Manager Agent
- Triggers: Batch closure.
- Inputs: Green CI, changelog, semantic version bump.
- Deliverables: Tagged release, Pages deployment confirmation, release notes.
- Labels: `release:rc`, `release:ga`.
- Exit criteria: `gh-pages` updated and site reachable.

### 3.12 Security Agent
- Triggers: Dependency bumps, external links, or CSP edits.
- Inputs: `package.json` if present, CSP policy, third-party assets.
- Deliverables: Security notes, CSP meta tag, dependency PR reviews.
- Labels: `type:security`.
- Exit criteria: No inline script without nonce, strict CSP in place.

### 3.13 Performance Agent
- Triggers: Rendering or bundle changes.
- Inputs: Lighthouse report, Web Vitals, size snapshots.
- Deliverables: Optimized assets and budgets documented in `perf-budgets.json`.
- Labels: `type:perf`.
- Exit criteria: Largest Contentful Paint under 2.5 s on Pages hosting.

### 3.14 Automation Agent
- Triggers: Repeating chores.
- Inputs: Issue templates, labeler rules.
- Deliverables: GitHub Actions, labeler config, CODEOWNERS.
- Labels: `type:automation`.
- Exit criteria: All gates automated where feasible.

## 4. Working in batches
- Cadence: Work proceeds in numbered batches, each batch fits a small, focused scope that is safe to merge.
- Batch document: `BATCH-<n>.md` contains scope, risks, exit criteria, and links to issues.
- Handoff timeboxes:
  - Planner publishes batch by T0.
  - Developers land features by T0+48 h.
  - QA and a11y review by T0+60 h.
  - Release by T0+72 h.
- If a task slips, move it to the next batch. Do not rush reviews.

## 5. Definition of Ready and Definition of Done
- Ready: User story defined, acceptance criteria written, files-to-touch listed, tests outlined, a11y implications noted, labels set.
- Done: Code committed with tests, CI green, reviewer approval, docs updated, a11y checks pass, Pages deployment verified.

## 6. Coding standards
- Language: Plain HTML, CSS, and vanilla JavaScript modules. TypeScript and a bundler can be added later if needed, but do not break Pages.
- Structure:
  - `assets/js/` game engine and UI modules
  - `assets/css/` design tokens and components
  - `assets/img/` icons and media
  - `docs/` for ADRs, UX, and guides
- Style: Prettier and ESLint recommended. Keep functions small and pure in engine code.
- Testing: Vitest or Jest for unit tests. Playwright optional for E2E in CI.

## 7. Security and privacy guardrails
- No secrets, tokens, or trackers. GitHub Pages only.
- Use a strict CSP via a meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'">
```

- Keep all scripts local. Do not eval strings. Do not fetch remote code.
- Accessibility and privacy are release blockers.

## 8. CI and deployment
Use the official GitHub Pages workflow. No secrets required.

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ "main" ]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # If a build step exists, add Node and build, then upload ./dist
      # - uses: actions/setup-node@v4
      #   with: { node-version: 20 }
      # - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

If a bundler is used, set `path: ./dist` in the upload step and ensure the app builds without secrets.

## 9. Labels and branch naming
- Labels: `type:feature`, `type:bug`, `type:docs`, `type:a11y`, `type:perf`, `type:engine`, `type:design`, `type:security`, `batch:<n>`, `priority:P1|P2|P3`.
- Branches: `agent/<role>/<task-id>-short-title`.
- Conventional commits:
  - `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## 10. Issue and PR templates

**.github/ISSUE_TEMPLATE/task.md**
```markdown
---
name: Task
about: Executable, testable unit of work
labels: ["batch:<n>"]
---

## Summary
Short description.

## Scope of change
- Files to touch
- Architecture notes

## Acceptance criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Tests
- Unit:
- E2E:

## A11y
- Keyboard support:
- Screen reader text:
```

**.github/pull_request_template.md**
```markdown
## What changed

## Why

## Screenshots

## Testing notes
- [ ] Unit tests added or updated
- [ ] E2E ran green in CI

## A11y checklist
- [ ] Focus order verified
- [ ] ARIA roles and labels present
- [ ] Color contrast validated
```

## 11. Minimal engine contract
- Board: 3x3 array of `"X" | "O" | null` in row-major order.
- Players: Human vs Human, optional Human vs CPU.
- Rules API:
  - `createGame() -> GameState`
  - `isLegalMove(state, index) -> boolean`
  - `applyMove(state, index) -> GameState`
  - `winner(state) -> 'X' | 'O' | 'draw' | null`
- UI subscribes to state changes and re-renders cells only when needed.

## 12. Backlog by asynchronous batches
Sixty numbered, bite-sized tasks with clear owners and outcomes. Agents can pick from the current batch. If one task depends on another, link it and hold the PR until the dependency merges.

### Batch 0 - Repo hygiene and Pages readiness
1. Initialize labels and branch protection. Owner: Automation Agent. Done: Labels created and rules enforced.
2. Add ISSUE and PR templates. Owner: Docs Agent. Done: Templates in `.github/`.
3. Create CODEOWNERS. Owner: Automation Agent. Done: Paths mapped to roles.
4. Add Prettier and basic ESLint or keep vanilla if no Node. Owner: Frontend Dev. Done: Format script or documentation.
5. Add Pages workflow file. Owner: Release Manager. Done: Successful dry run on main.
6. Create `docs/adr/0001-hosting-model.md`. Owner: Architect. Done: ADR merged.
7. Add `CONTRIBUTING.md`. Owner: Docs Agent. Done: Contributors guided.
8. Set up Lighthouse CI action or manual checklist. Owner: Performance Agent. Done: Budget file present.
9. Add CSP meta tag with comments. Owner: Security Agent. Done: No console CSP errors.
10. Add basic 404.html for SPA and direct links. Owner: Frontend Dev. Done: 404 resolves to index.

### Batch 1 - Core engine and UI skeleton
11. Implement board model and render grid. Owner: Game Engine Dev. Done: Grid clickable.
12. Add current player indicator and turn swap. Owner: Frontend Dev. Done: Accurate turn display.
13. Implement `winner()` and draw detection. Owner: Game Engine Dev. Done: Unit tests pass.
14. Highlight winning line and lock board. Owner: Frontend Dev. Done: Manual test OK.
15. Add reset button that clears state. Owner: Frontend Dev. Done: Works from any state.
16. Keyboard interaction for cells 1-9. Owner: Accessibility Agent. Done: Tab and Enter supported.
17. Add live region for status updates. Owner: Accessibility Agent. Done: Screen reader announces.
18. Minimal CSS with design tokens. Owner: UX Design Agent. Done: Tokens documented.
19. Add favicon and manifest stub. Owner: Frontend Dev. Done: Valid links in head.
20. Provide engine unit tests. Owner: QA Agent. Done: Coverage report attached.

### Batch 2 - Game modes and persistence
21. Add CPU opponent easy mode: random legal move. Owner: Game Engine Dev. Done: No illegal moves.
22. Add CPU normal mode: rule-based center-corner strategy. Owner: Game Engine Dev. Done: Passes strategy tests.
23. Settings modal for player vs player or player vs CPU. Owner: Frontend Dev. Done: Choice persists.
24. Persist last game in `localStorage`. Owner: Frontend Dev. Done: Reload restores.
25. Add scoreboard with W-L-D counts. Owner: Frontend Dev. Done: Separate per mode.
26. Soft reset vs hard reset choices. Owner: Frontend Dev. Done: Confirm dialog.
27. Sound toggles with short click and win tones. Owner: UX Design Agent. Done: Respect reduced motion and mute.
28. Onboarding tooltip for first-time users. Owner: UX Design Agent. Done: Dismiss persists.
29. Add share link that encodes mode and theme. Owner: Frontend Dev. Done: Opens with correct state.
30. Export-import settings as JSON. Owner: Docs Agent. Done: Schema documented.

### Batch 3 - Visuals, theming, and i18n
31. Add light and dark themes. Owner: UX Design Agent. Done: Prefers-color-scheme respected.
32. Animate piece placement with reduced-motion fallback. Owner: Frontend Dev. Done: No jank.
33. Add color-contrast tokens. Owner: Accessibility Agent. Done: Contrast meets AA.
34. Implement ARIA grid with roving tabindex. Owner: Accessibility Agent. Done: Keyboard grid complete.
35. Internationalize all strings to `i18n/en.json`. Owner: Localization Agent. Done: No inline strings.
36. Add `i18n/fr.json`. Owner: Localization Agent. Done: Language toggle works.
37. Adjust layouts for long strings. Owner: UX Design Agent. Done: No overflow.
38. RTL support smoke check. Owner: Localization Agent. Done: `dir=rtl` renders correctly.
39. Add help page explaining rules and controls. Owner: Docs Agent. Done: Linked from header.
40. Add SEO meta tags and Open Graph. Owner: Docs Agent. Done: Title and description set.

### Batch 4 - Quality, testing, and metrics
41. Unit tests for UI event handlers. Owner: QA Agent. Done: Click and keyboard covered.
42. Snapshot tests for core DOM. Owner: QA Agent. Done: Stable snapshots.
43. Playwright E2E: win path and draw path. Owner: QA Agent. Done: Recorded and green.
44. Lighthouse budgets: LCP 2.5 s, JS < 50 KB. Owner: Performance Agent. Done: Report attaches to PR.
45. Perf optimization: inline critical CSS if needed. Owner: Frontend Dev. Done: LCP improves.
46. Defer non-critical JS. Owner: Frontend Dev. Done: No behavior regressions.
47. Add size-limit or similar. Owner: Performance Agent. Done: Budget enforced in CI.
48. Axe checks in CI or manual report. Owner: Accessibility Agent. Done: No critical violations.
49. Link checker for external URLs. Owner: Automation Agent. Done: Broken links fail CI.
50. Add error boundary or safe-guard for corrupted state. Owner: Security Agent. Done: Graceful reset.

### Batch 5 - Polish, reliability, and release discipline
51. Create CHANGELOG.md with Keep a Changelog format. Owner: Release Manager. Done: First release notes.
52. Add version in footer and About dialog. Owner: Docs Agent. Done: Matches tag.
53. Offline-ready optional PWA. Owner: Frontend Dev. Done: Install prompt behind flag.
54. Page titles and focus management on dialog open-close. Owner: Accessibility Agent. Done: Focus returns reliably.
55. Theme persistence and system setting detection. Owner: Frontend Dev. Done: Avoids flashes.
56. Print-friendly rules page. Owner: Docs Agent. Done: Simple style.
57. Add game replay mode that steps through moves. Owner: Game Engine Dev. Done: Keyboard control supported.
58. Export replay to a small JSON file. Owner: Docs Agent. Done: Schema documented.
59. Add animated favicon on win. Owner: UX Design Agent. Done: CPU and battery friendly.
60. Milestone v1.0.0 release. Owner: Release Manager. Done: Tag, Pages URL validated, announcement.

## 13. Handoff protocol
1. Planner links issues to `BATCH-<n>.md` and sets labels.
2. Developer opens branch `agent/<role>/<task-id>-short-title` and pushes commits with Conventional Commit messages.
3. PR includes screenshots, short demo GIF if UI changed, and updated docs.
4. CI runs unit, E2E, and budget checks. Green CI required.
5. QA and a11y review with labels. Reviewers block on P1 issues.
6. Release Manager merges to `main`. GitHub Pages deploys automatically to `gh-pages`.
7. Post-deploy check: Load site, verify version and changelog.

## 14. Risk and rollback
- If Pages deploy fails, revert to previous commit on `main` or temporarily disable Pages while investigating.
- Keep a copy of the last working `dist` folder or rely on `gh-pages` history for rollback.

## 15. Contact and ownership
- CODEOWNERS defines reviewers by path.
- Use Discussions for feedback, Issues for work, PRs for changes.

---

This document is living. Docs Agent updates it at the start and end of each batch.

