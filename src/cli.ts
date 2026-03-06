import type { CliOptions } from './types.js';
import { KillErrorCode, SlayError } from './utils/errors.js';

const HELP = `
  slay - Kill processes by port. Beautifully.

  Usage:
    slay <port> [port...]     Kill process(es) on given port(s)
    slay --all                Kill all listening processes
    slay -i                   Interactive mode (select from list)

  Options:
    -f, --force               SIGKILL immediately, skip prompt
    -y, --yes                 Skip confirmation prompt
    --soft                    SIGTERM first, escalate to SIGKILL
    -v, --verbose             Show signal details, timing, protocol
    -n, --dry-run             Preview what would be killed (no kill)
    --udp                     Target UDP ports instead of TCP
    -t, --tree                Kill process tree (children first)
    --json                    Output NDJSON (for scripting)
    -w, --watch               Keep polling & killing (Ctrl+C to stop)
    -i, --interactive         TUI process selector
    -h, --help                Show this help

  Examples:
    slay 3000                 Kill whatever's on port 3000
    slay 3000 8080            Kill both ports
    slay 3000 -f              Force kill, no questions asked
    slay --all -y             Kill everything listening
    slay 3000 --json          Machine-readable output
    slay 3000 -w              Watch mode: auto-kill on respawn
    slay 3000 -n              Dry run: see what would be killed
    slay 3000 --udp           Kill UDP listeners on port 3000
    slay 3000 -t              Kill process and its children
`;

export function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);

  const opts: CliOptions = {
    ports: [],
    force: false,
    yes: false,
    soft: false,
    verbose: false,
    all: false,
    json: false,
    watch: false,
    interactive: false,
    dryRun: false,
    tree: false,
    protocol: 'tcp',
    help: false,
  };

  for (const arg of args) {
    if (arg === '-h' || arg === '--help') {
      opts.help = true;
    } else if (arg === '-f' || arg === '--force') {
      opts.force = true;
    } else if (arg === '-y' || arg === '--yes') {
      opts.yes = true;
    } else if (arg === '--soft') {
      opts.soft = true;
    } else if (arg === '-v' || arg === '--verbose') {
      opts.verbose = true;
    } else if (arg === '--all') {
      opts.all = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '-w' || arg === '--watch') {
      opts.watch = true;
    } else if (arg === '-i' || arg === '--interactive') {
      opts.interactive = true;
    } else if (arg === '-n' || arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '-t' || arg === '--tree') {
      opts.tree = true;
    } else if (arg === '--udp') {
      opts.protocol = 'udp';
    } else if (/^\d+$/.test(arg)) {
      const port = Number.parseInt(arg, 10);
      if (port < 1 || port > 65535) {
        throw new SlayError(KillErrorCode.INVALID_PORT, arg);
      }
      opts.ports.push(port);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return opts;
}

export function showHelp(): void {
  console.log(HELP);
}

export function validateOptions(opts: CliOptions): void {
  if (!opts.help && !opts.all && !opts.interactive && opts.ports.length === 0) {
    throw new Error('No ports specified. Use slay <port>, slay --all, or slay -i');
  }
}
