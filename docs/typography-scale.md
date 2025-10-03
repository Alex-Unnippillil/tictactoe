# Typography scale

The Tic Tac Toe UI relies on a fluid, modular scale so typography adapts smoothly between small and large viewports. Tokens are defined in `site/css/style.css` under the `:root` selector using `clamp()` to interpolate between minimum and maximum sizes.

## Font size tokens

| Token | Clamp expression | Primary use |
| --- | --- | --- |
| `--font-size-100` | `clamp(0.78rem, 0.12vw + 0.74rem, 0.86rem)` | Microcopy, legal text |
| `--font-size-200` | `clamp(0.88rem, 0.18vw + 0.82rem, 0.98rem)` | Captions and helper text |
| `--font-size-300` | `clamp(1rem, 0.25vw + 0.9rem, 1.125rem)` | Body copy (default on `<body>`) |
| `--font-size-400` | `clamp(1.15rem, 0.35vw + 1rem, 1.35rem)` | Emphasised body text, subtitles |
| `--font-size-500` | `clamp(1.3rem, 0.5vw + 1.05rem, 1.8rem)` | Section titles, toolbar titles |
| `--font-size-600` | `clamp(1.6rem, 0.75vw + 1.25rem, 2.2rem)` | Secondary page headings |
| `--font-size-700` | `clamp(1.95rem, 1.05vw + 1.5rem, 2.6rem)` | Primary page headings |

### Usage guidelines

- Prefer the tokens over hard-coded `rem` or `px` values for new components so typography stays consistent.
- Larger breakpoints are intentionally capped to preserve hierarchy and avoid runaway scaling on very wide screens.
- When a component needs a value between two tokens, consider adjusting layout spacing or introducing a modifier class before adding a new token.

## Spacing tokens

To keep rhythm between components, the same `:root` block also defines fluid spacing tokens (`--space-3xs` through `--space-3xl`). Pair typography and spacing tokens together (for example, `--font-size-400` with `--space-md`) for predictable vertical rhythm.

For questions or adjustments, update the token definitions first and then refactor component styles rather than overriding them locally.
