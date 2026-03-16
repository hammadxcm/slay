# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
