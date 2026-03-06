# slay

Kill processes by port. Beautifully.

[![CI](https://github.com/hammadxcm/slay/actions/workflows/ci.yml/badge.svg)](https://github.com/hammadxcm/slay/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/slay-port.svg)](https://www.npmjs.com/package/slay-port)
[![license](https://img.shields.io/npm/l/slay-port.svg)](https://github.com/hammadxcm/slay/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/slay-port.svg)](https://nodejs.org)

## Install

```bash
npm i -g slay-port
```

Or run directly:

```bash
npx slay-port 3000
```

## Usage

```
slay <port> [port...]     Kill process(es) on given port(s)
slay --all                Kill all listening processes
slay -i                   Interactive mode (select from list)
```

### Options

| Flag | Description |
|------|-------------|
| `-f, --force` | SIGKILL immediately, skip prompt |
| `-y, --yes` | Skip confirmation prompt |
| `--soft` | SIGTERM first, escalate to SIGKILL |
| `-v, --verbose` | Show signal details |
| `--json` | Output NDJSON (for scripting) |
| `-w, --watch` | Keep polling & killing (Ctrl+C to stop) |
| `-i, --interactive` | TUI process selector |
| `-h, --help` | Show help |

## Examples

Kill a single port:

```bash
slay 3000
```

Kill multiple ports:

```bash
slay 3000 8080
```

Force kill, no questions asked:

```bash
slay 3000 -f
```

Soft kill (SIGTERM first, then SIGKILL):

```bash
slay 3000 --soft
```

Watch mode -- auto-kill on respawn:

```bash
slay 3000 -w
```

Interactive TUI selector:

```bash
slay -i
```

Machine-readable JSON output:

```bash
slay 3000 --json
```

Pipe to other tools:

```bash
slay 3000 --json | jq '.pid'
```

Kill everything listening, no prompt:

```bash
slay --all -y
```

## Architecture

slay uses a **platform adapter pattern** to work across macOS, Linux, and Windows:

```
src/
  cli.ts            # Argument parsing & validation
  core/
    discovery.ts    # Port/process discovery
    killer.ts       # Process killing logic
    labels.ts       # Process name resolution
  platform/
    index.ts        # Platform detection & adapter selection
    unix.ts         # macOS/Linux: lsof-based
    windows.ts      # Windows: netstat-based
  ui/
    format.ts       # Output formatting
    colors.ts       # Terminal colors
    animation.ts    # Kill animations
    prompt.ts       # Confirmation prompts
    interactive.ts  # TUI selector
  utils/
    exec.ts         # Child process helpers
    errors.ts       # Error types
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE) -- Hammad Khan
