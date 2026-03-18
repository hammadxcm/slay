# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.2] - 2026-03-18

### Added

- **Blood, Arctic, Nebula themes** — replacing Dracula and Nord for a total of 9 themes
- **Canvas-based ambient effects** — real animated effects rendered on a full-viewport `<canvas>`:
  - Blood: falling red rain droplets with gradient trails
  - Matrix: falling Japanese characters + hex digits in columns
  - Cyberpunk: fast-decaying neon spark trails
  - Synthwave: animated perspective grid with sun at horizon
  - Nebula: slow pulsing cosmic dust particles with glow
  - Arctic: gentle snowfall particles
  - Gruvbox: warm floating firefly dots with pulsing glow
- **Per-theme transition animations** — blood drip, frost crystallize, cosmic swirl
- **Per-theme SVG icons** in theme picker dropdown (moon, sun, droplet, snowflake, star, etc.)
- Performance: canvas pauses when tab not visible, 40% fewer particles on touch devices, respects `prefers-reduced-motion`

### Changed

- Replaced Dracula/Nord themes with Blood/Arctic/Nebula across all components
- Removed CSS-only `::after` pseudo-element ambient effects (scanlines, grid, grain) — replaced by canvas effects
- Theme picker now shows SVG icons instead of colored dots
- Updated hero synonyms for new themes (Blood: "Gore Mode.", Arctic: "Sub-Zero.", Nebula: "Cosmic.")

## [0.3.1] - 2026-03-18

### Added

- **9-theme system** for the website — Dark, Light, Blood, Synthwave, Matrix, Cyberpunk, Gruvbox, Arctic, Nebula
- **Per-theme View Transitions** — each theme has a unique transition animation (radial morph, warm fade, blood drip, frost crystallize, cosmic swirl, VHS wipe, glitch dissolve, hologram glitch, TV static)
- **Canvas-based ambient background effects** — blood rain, matrix rain, neon sparks, retro grid, cosmic dust, snowfall, fireflies, with per-theme blob color overrides
- **Per-theme hero synonyms** — the rotating tagline word changes personality based on active theme (e.g., Matrix: "Sudo Slay.", Blood: "Gore Mode.", Synthwave: "Turbo Mode.")
- **Theme picker dropdown** replacing the old binary dark/light toggle, with keyboard navigation and View Transitions API integration
- `themes.css`, `theme-transitions.css`, `theme-ambient.css` — new stylesheets for the multi-theme system
- `theme-effects.ts` — canvas-based ambient effect engine
- CSS variables: `--glow-color`, `--ambient-blob-opacity`, `--spotlight-color`, `--nav-bg-scrolled`, `--gradient-text`
- `themechange` custom event dispatched on theme switch for cross-component reactivity
- `prefers-reduced-motion` override for all theme transition animations
- Flash prevention for all 9 themes on page load

### Changed

- `global.css` — extracted hardcoded ambient blob opacity, spotlight color, and gradient text to CSS variables
- `Navbar.astro` — uses `var(--nav-bg-scrolled)` instead of hardcoded scrolled background
- `Hero.astro` — `word-glow` keyframe uses `var(--glow-color)` for per-theme glow tint
- `Layout.astro` — flash prevention handles all theme names, imports 3 new CSS files, adds theme canvas element

## [0.2.0] - 2026-03-16

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
- Website: 3 new feature cards (Profile Presets, Port Ranges, Port Info)
- Website: Profiles demo tab with 3 demos (Init Config, Run Profile, Port Range)
- Website: i18n keys for all 10 locales

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
