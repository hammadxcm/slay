# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
