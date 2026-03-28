<h1 align="center">slay</h1>

<p align="center">
  <b>kill processes by port. Beautifully.</b>
</p>

<p align="center">
  <a href="https://slay.fyniti.co.uk"><img src="https://img.shields.io/badge/Website-slay--port-ff6b6b" alt="Website"></a>
  <a href="https://github.com/hammadxcm/slay/actions/workflows/ci.yml"><img src="https://github.com/hammadxcm/slay/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/slay-port"><img src="https://img.shields.io/npm/v/slay-port.svg" alt="npm version"></a>
  <a href="https://jsr.io/@hammadxcm/slay"><img src="https://jsr.io/badges/@hammadxcm/slay" alt="JSR"></a>
  <a href="https://www.npmjs.com/package/slay-port"><img src="https://img.shields.io/npm/dm/slay-port.svg" alt="npm downloads"></a>
  <a href="https://github.com/hammadxcm/slay/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/slay-port.svg" alt="license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/slay-port.svg" alt="node version"></a>
  <a href="https://github.com/hammadxcm/slay/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="https://github.com/hammadxcm/slay#install"><img src="https://img.shields.io/badge/homebrew-available-orange.svg" alt="Homebrew"></a>
</p>

---

## Install

```bash
# npm
npx slay-port 3000
npm i -g slay-port

# pnpm
pnpm dlx slay-port 3000
pnpm add -g slay-port

# yarn
yarn dlx slay-port 3000
yarn global add slay-port

# bun
bunx slay-port 3000
bun add -g slay-port

# Homebrew (macOS/Linux)
brew install hammadxcm/slay/slay-port

# Standalone binary (no runtime needed)
# Download from GitHub Releases: https://github.com/hammadxcm/slay/releases
```

Full docs & interactive demos at **[slay.fyniti.co.uk](https://slay.fyniti.co.uk)**

Also available on **[JSR](https://jsr.io/@hammadxcm/slay)** for Deno and modern TypeScript projects.

<!-- why -->

## Why Slay?

- **Interactive TUI** with search and multi-select
- **Profile presets** — save port combos as named profiles
- **Port ranges** — kill `8000-8010` in one command
- **Port info** — inspect ports without killing (`slay info 3000`)
- **Graceful shutdown** — SIGTERM first, escalate to SIGKILL
- **Watch mode** — auto-kill processes that respawn
- **Process tree killing** — take down children first
- **JSON output** — pipe to `jq` for scripting
- **Dry run** — preview what would be killed
- **Smart labels** — auto-detects Node.js, Python, Docker, PostgreSQL, and more
- **Shell completions** — tab-complete in bash, zsh, and fish
- **Kill by name** — target processes by name with regex, exclude specific processes
- **Post-kill hooks** — auto-run commands after killing (`--then "npm start"`)
- **Port check** — check availability and find next free port for CI scripts
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

### Kill a port range

```bash
slay 8000-8010
```

### Profile presets

```bash
# Create a config file
slay init

# Add a profile interactively
slay profile add

# List profiles
slay profile list

# Run a saved profile
slay --profile dev
```

**`.slay.json` format:**

```json
{
  "profiles": {
    "dev": { "ports": [3000, 5173, 5432], "soft": true },
    "clean": { "all": true, "force": true }
  }
}
```

> **Supported profile fields:** `ports`, `force`, `yes`, `soft`, `verbose`, `all`, `watch`, `dryRun`, `tree`, `protocol`, `name`, `exclude`, `thenRun`

> **Tip:** CLI flags override profile values. `slay --profile dev --force` uses the profile's ports but force-kills.

### Port info

```bash
slay info 3000
```

> Shows PID, command, CPU, memory, and uptime without killing anything.

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

### Kill by process name

```bash
slay --name node              # Kill all processes named "node"
slay --name "python.*"        # Regex pattern matching
slay --all --exclude nginx    # Kill all except nginx
slay 3000 --exclude postgres  # Kill port 3000 unless it's postgres
```

### Post-kill hook

```bash
slay 3000 --then "npm start"           # Auto-restart after kill
slay 3000 -w --then "npm run dev"      # Watch mode + auto-restart
```

### Check port availability

```bash
slay check 3000                # Exit 0 if free, exit 1 if occupied
slay check 3000 8080 5432      # Check multiple ports
slay check 3000 --json         # JSON output for scripting
slay check --next 3000         # Find next free port from 3000
slay check --next 3000-4000    # Find next free port in range
```

> **Tip:** Use in scripts: `PORT=$(slay check --next 3000)` to get the first available port.

### Shell completions

```bash
# Bash — add to ~/.bashrc
eval "$(slay completions bash)"

# Zsh — add to ~/.zshrc
eval "$(slay completions zsh)"

# Fish — add to ~/.config/fish/config.fish
slay completions fish | source
```

<!-- subcommands -->

## Subcommands

| Command | Description |
|---|---|
| `slay init` | Create a `.slay.json` config file in the current directory |
| `slay profile list` | List all saved profiles |
| `slay profile add` | Interactively create a new profile |
| `slay profile rm <name>` | Remove a saved profile |
| `slay info <port>` | Inspect a port (PID, command, CPU, memory, uptime) without killing |
| `slay check <port>` | Check if port(s) are free (exit 0 = free, 1 = occupied) |
| `slay check --next <port>` | Find the next available port starting from `<port>` |
| `slay completions <shell>` | Output shell completions (bash, zsh, fish) |

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
| `--profile <name>` | Run a saved profile from `.slay.json` |
| `--name <pattern>` | Kill processes matching name (supports regex) |
| `--exclude <pattern>` | Exclude matching processes from kill (repeatable) |
| `--then <cmd>` | Run command after kill (e.g. `--then "npm start"`) |
| `-h, --help` | Show help |

<!-- interactive -->

## Interactive Mode

Launch with `slay -i` to get a full TUI process selector.

| Key | Action |
|---|---|
| <kbd>&uarr;</kbd> <kbd>&darr;</kbd> / <kbd>j</kbd> <kbd>k</kbd> | Navigate |
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
- `findConfig`, `loadConfig`, `saveConfig`, `resolveProfile`, `mergeProfileOpts` — config
- `getProcessDetail` — process detail
- `checkPort`, `checkPorts`, `findNextAvailable`, `isPortFree` — port availability
- `runHook` — post-kill hook execution
- `matchesPattern`, `excludeProcesses` — process name filtering
- `findByName` — process discovery by name
- `SlayError` — error type
- Types: `ProcessInfo`, `KillResult`, `CliOptions`, `PlatformAdapter`, `KillErrorCode`, `ProcessDetail`, `ProfileOptions`, `SlayConfig`

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

// Port check
{"type": "check", "port": 3000, "available": false, "pid": 1234, "command": "node"}

// Next available port
{"type": "next_available", "port": 3001, "range": [3000, 3999]}

// Post-kill hook
{"type": "hook", "command": "npm start", "exitCode": 0, "success": true}
```

<!-- architecture -->

## Architecture

```
src/
  cli.ts              Argument parsing & validation
  config.ts           Config file discovery & profile resolution
  commands/
    init.ts           slay init — create .slay.json
    profile.ts        slay profile list/add/rm
    profile-builder.ts Interactive profile creation TUI
    info.ts           slay info — inspect ports without killing
    check.ts          slay check — port availability & next free port
  completions/
    index.ts          Shell completion dispatcher
    bash.ts           Bash completion script generator
    zsh.ts            Zsh completion script generator
    fish.ts           Fish completion script generator
  core/
    discovery.ts      Port/process discovery
    killer.ts         Process killing logic
    labels.ts         Smart label resolution
    tree.ts           Process tree discovery
    filter.ts         Process name matching & exclusion
    check.ts          Port availability checking
    hook.ts           Post-kill hook execution
  platform/
    index.ts          Platform detection & adapter selection
    unix.ts           macOS/Linux (lsof)
    windows.ts        Windows (netstat/taskkill)
    detail.ts         Process detail (CPU, memory, uptime)
  ui/
    format.ts         Output formatting
    colors.ts         Terminal colors
    animation.ts      Kill animations
    prompt.ts         Confirmation & text input prompts
    interactive.ts    TUI selector
  utils/
    exec.ts           Child process helpers
    errors.ts         Error types
```

<!-- website -->

## Website

The landing page at [slay.fyniti.co.uk](https://slay.fyniti.co.uk) features:

- **9 color themes** — Dark, Light, Blood, Synthwave, Matrix, Cyberpunk, Gruvbox, Arctic, Nebula
- **Per-theme View Transitions** — unique animations when switching themes (blood drip, glitch dissolve, VHS wipe, frost crystallize, cosmic swirl, hologram glitch, TV static, and more)
- **Canvas-based ambient effects** — blood rain, matrix falling characters, neon sparks, retro grid, cosmic dust, snowfall, fireflies — all rendered on a full-viewport canvas
- **Per-theme hero synonyms** — rotating tagline changes personality with each theme
- 10-language i18n support (EN, ZH, HI, ES, AR, FR, BN, PT, RU, JA) with RTL
- Interactive terminal demos with animated kill sequences
- Live stats from npm and GitHub APIs
- Ambient visual effects (gradient mesh, cursor spotlight, scroll progress)
- SVG feature icons with per-card hover animations
- Responsive design with glassmorphism

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

Contributions of all kinds are welcome! Check out the [good first issues](https://github.com/hammadxcm/slay/labels/good%20first%20issue) to get started.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hammadxcm/slay&type=Date)](https://star-history.com/#hammadxcm/slay&Date)

## License

[MIT](LICENSE) — Hammad Khan
