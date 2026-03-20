# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.31] - 2026-03-21

### Added

- **Profile presets** — save port/flag combos as named profiles in `.slay.json`
  - `slay init` creates config with example profiles
  - `slay profile list` / `slay profile add` / `slay profile rm <name>`
  - `slay --profile <name>` runs a saved profile (CLI flags override)
- **Port ranges** — `slay 8000-8010` expands to all ports in range (max 1000)
- **Port info** — `slay info <port>` inspects processes without killing (PID, CPU, memory, uptime)
- Config file discovery walks CWD → parent → `$HOME`
- Interactive profile builder TUI (`slay profile add`)
- `textInput()` prompt for readline-based input
- Process detail module (`getProcessDetail`) for CPU/memory/uptime via `ps` / `wmic`
- New API exports: `findConfig`, `loadConfig`, `saveConfig`, `resolveProfile`, `mergeProfileOpts`, `getProcessDetail`
- New types: `ProcessDetail`, `ProfileOptions`, `SlayConfig`
- Husky + lint-staged to enforce biome checks on commit

### Added (Website)

- **9-theme system** — Dark, Light, Blood, Synthwave, Matrix, Cyberpunk, Gruvbox, Arctic, Nebula
- **Per-theme View Transitions** — radial morph, warm fade, blood drip, frost crystallize, cosmic swirl, VHS wipe, glitch dissolve, hologram glitch, TV static
- **Canvas-based ambient effects** — blood rain, matrix rain, neon sparks, retro grid, cosmic dust, snowfall, fireflies
- **Per-theme hero synonyms** — rotating tagline changes per theme (e.g., Matrix: "Sudo Slay.", Blood: "Gore Mode.")
- **Theme picker dropdown** with keyboard navigation, SVG icons, random theme button, and View Transitions API
- **Stats component** with animated counters and live npm/GitHub API data (clickable links to npm and GitHub)
- **Comparison component** — old way vs slay way side-by-side
- **Marquee component** — scrolling tech icon slider (Node.js, Python, Docker, etc.)
- **Server logger** integration for branded dev server output
- 3 new feature cards: Profile Presets, Port Ranges, Port Info
- Profiles demo tab with 3 demos (Init Config, Run Profile, Port Range)
- i18n keys for all 10 locales across new components
- `themes.css`, `theme-transitions.css`, `theme-effects.ts` — theme system stylesheets and canvas engine
- CSS variables: `--glow-color`, `--ambient-blob-opacity`, `--spotlight-color`, `--nav-bg-scrolled`, `--gradient-text`, `--blob-1/2/3`
- `themechange` custom event for cross-component theme reactivity
- `prefers-reduced-motion` override for all animations and canvas effects
- Flash prevention for all 9 themes on page load
- `aria-controls` on ThemeToggle, `aria-live`/`aria-atomic` on Hero rotating word
- Footer "Made by Hammad Khan" links to GitHub profile
- 280 tests covering all 35 source files including i18n parity validation

### Changed (Website)

- Eliminated `theme-ambient.css` via `--blob-1/2/3` CSS variables (DRY)
- Deduplicated z-index in `theme-transitions.css` via shared base rules
- Replaced hardcoded `rgba(255,107,107)` in animations with `color-mix(var(--red))`
- Refactored `theme-effects.ts`: slim Mote type, `mote()` factory, `drawTrail`/`drawGlowDot` helpers, flat effectMap, cached currentEntry
- Derived ThemeToggle arrays from DOM via `data-theme-color` (eliminated triple duplication)
- Fixed `var(--accent)` bug in `global.css` RTL rule
- Marquee icons increased from 20px to 28px with larger font

### Fixed

- Scoped Demo tab selectors to demos section to avoid Install tab conflict
- CI: ensure Homebrew update runs even when other jobs fail
- Formatted `package.json` and `jsr.json` to pass biome check

## [0.1.4] - 2026-03-16

### Fixed

- CI pipeline fixes for release workflow

## [0.1.3] - 2026-03-16

### Fixed

- Homebrew formula and release workflow improvements

## [0.1.0] - 2026-03-06

### Added

- Kill processes by port number (`slay <port>`)
- Multi-port support (`slay 3000 8080`)
- Force kill with `-f` / `--force` (SIGKILL)
- Soft kill with `--soft` (SIGTERM then SIGKILL)
- Watch mode with `-w` / `--watch`
- Interactive TUI selector with `-i` / `--interactive`
- Kill all listening processes with `--all`
- JSON output with `--json` for scripting
- Verbose mode with `-v` / `--verbose`
- Confirmation prompts (skip with `-y` / `--yes`)
- Cross-platform support (macOS, Linux, Windows)
