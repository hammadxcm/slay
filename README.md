<h1 align="center">slay</h1>

<p align="center">
  <b>Kill processes by port. Beautifully.</b>
</p>

<p align="center">
  <a href="https://github.com/hammadxcm/slay/actions/workflows/ci.yml"><img src="https://github.com/hammadxcm/slay/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/slay-port"><img src="https://img.shields.io/npm/v/slay-port.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/slay-port"><img src="https://img.shields.io/npm/dm/slay-port.svg" alt="npm downloads"></a>
  <a href="https://github.com/hammadxcm/slay/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/slay-port.svg" alt="license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/slay-port.svg" alt="node version"></a>
</p>

---

## Quick Start

```bash
npx slay-port 3000
```

Or install globally:

```bash
npm i -g slay-port
slay 3000
```

<!-- why -->

## Why Slay?

- **Interactive TUI** with search and multi-select
- **Graceful shutdown** — SIGTERM first, escalate to SIGKILL
- **Watch mode** — auto-kill processes that respawn
- **Process tree killing** — take down children first
- **JSON output** — pipe to `jq` for scripting
- **Dry run** — preview what would be killed
- **Smart labels** — auto-detects Node.js, Python, Docker, PostgreSQL, and more
- **Cross-platform** — macOS, Linux, Windows
- **Zero runtime dependencies**

<!-- usage -->

## Usage

### Kill a port

```bash
slay 3000
```

### Kill multiple ports

```bash
slay 3000 8080 5432
```

### Force kill (no prompt)

```bash
slay 3000 -f
```

### Graceful shutdown

```bash
slay 3000 --soft
```

> **Tip:** `--soft` sends SIGTERM first and escalates to SIGKILL only if the process doesn't exit.

### Interactive mode

```bash
slay -i
```

### Watch mode

```bash
slay 3000 -w
```

### Dry run

```bash
slay 3000 -n
```

### Kill process tree

```bash
slay 3000 -t
```

### Kill all listeners

```bash
slay --all -y
```

### JSON output

```bash
slay 3000 --json
```

### Pipe to jq

```bash
slay 3000 --json | jq '.pid'
```

### UDP ports

```bash
slay 53 --udp
```

<!-- flags -->

## Flags

| Flag | Description |
|---|---|
| `-f, --force` | SIGKILL immediately, skip prompt |
| `-y, --yes` | Skip confirmation prompt |
| `--soft` | SIGTERM first, escalate to SIGKILL |
| `-v, --verbose` | Show signal details, timing, protocol |
| `-n, --dry-run` | Preview what would be killed (no kill) |
| `-t, --tree` | Kill process tree (children first) |
| `--udp` | Target UDP ports instead of TCP |
| `--json` | Output NDJSON for scripting |
| `-w, --watch` | Keep polling & killing (Ctrl+C to stop) |
| `-i, --interactive` | TUI process selector |
| `--all` | Kill all listening processes |
| `-h, --help` | Show help |

<!-- interactive -->

## Interactive Mode

Launch with `slay -i` to get a full TUI process selector.

| Key | Action |
|---|---|
| <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>j</kbd> <kbd>k</kbd> | Navigate |
| <kbd>Space</kbd> | Toggle selection |
| <kbd>a</kbd> | Toggle all |
| <kbd>/</kbd> | Search |
| <kbd>Enter</kbd> | Confirm kill |
| <kbd>q</kbd> | Quit |

<!-- labels -->

## Smart Labels

Slay auto-detects process types and known ports:

**Recognized commands:** Node.js, Python, Ruby, Java, Go, Deno, Bun, PHP, Nginx, Apache, Docker, Electron, VS Code

**Known ports:**

| Port | Label |
|---|---|
| 3000 | Dev Server |
| 4200 | Angular |
| 5173 | Vite |
| 5432 | PostgreSQL |
| 3306 | MySQL |
| 6379 | Redis |
| 8080 | HTTP Alt |
| 8888 | Jupyter |
| 27017 | MongoDB |

<!-- api -->

## Programmatic API

```ts
import { findByPort, killProcess, platform } from 'slay-port';

const procs = await findByPort(platform, 3000);

for (const proc of procs) {
  const result = await killProcess(platform, proc);
  console.log(`Killed PID ${result.pid} on port ${result.port}`);
}
```

**Exports:**

- `findByPort`, `findByPorts`, `findAllListening` — discovery
- `killProcess`, `killAll` — killing
- `enrichLabel`, `isSystemPort` — labels
- `platform`, `setPlatform` — platform adapter
- `SlayError` — error type
- Types: `ProcessInfo`, `KillResult`, `CliOptions`, `PlatformAdapter`, `KillErrorCode`

<!-- json -->

## JSON Output

When using `--json`, slay emits NDJSON with these event types:

```jsonc
// Process found
{"type": "found", "pid": 1234, "port": 3000, "command": "node"}

// Process killed
{"type": "killed", "pid": 1234, "port": 3000, "signal": "SIGKILL"}

// Kill failed
{"type": "failed", "pid": 1234, "port": 3000, "error": "EPERM"}

// Dry run
{"type": "dry_run", "pid": 1234, "port": 3000, "command": "node"}

// Summary
{"type": "summary", "killed": 1, "failed": 0}
```

<!-- architecture -->

## Architecture

```
src/
  cli.ts              Argument parsing & validation
  core/
    discovery.ts      Port/process discovery
    killer.ts         Process killing logic
    labels.ts         Smart label resolution
  platform/
    index.ts          Platform detection & adapter selection
    unix.ts           macOS/Linux (lsof)
    windows.ts        Windows (netstat/taskkill)
  ui/
    format.ts         Output formatting
    colors.ts         Terminal colors
    animation.ts      Kill animations
    prompt.ts         Confirmation prompts
    interactive.ts    TUI selector
  utils/
    exec.ts           Child process helpers
    errors.ts         Error types
```

<!-- platform -->

## Cross-Platform Support

| Platform | Backend |
|---|---|
| macOS | `lsof` |
| Linux | `lsof` |
| Windows | `netstat` + `taskkill` |

<!-- footer -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE) — Hammad Khan
