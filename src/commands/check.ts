import { checkPorts, findNextAvailable } from '../core/check.js';
import { platform } from '../platform/index.js';
import type { CliOptions } from '../types.js';
import { c } from '../ui/colors.js';
import { jsonEvent } from '../ui/format.js';

export async function runCheck(opts: CliOptions): Promise<void> {
  const nextArg = opts.subArgs.find((s) => s.startsWith('next:'));

  if (nextArg) {
    const rawValue = nextArg.slice(5); // after "next:"
    let start: number;
    let end: number;
    if (rawValue.includes('-')) {
      const [s, e] = rawValue.split('-').map(Number);
      start = s;
      end = e;
    } else {
      start = Number(rawValue);
      end = start + 999;
    }

    const port = await findNextAvailable(start, end);
    if (port === null) {
      if (opts.json) console.log(jsonEvent('next_available', { port: null, range: [start, end] }));
      else console.log(`\n  ${c.red('No free port found')} in range ${start}-${end}\n`);
      process.exit(1);
    }
    if (opts.json) console.log(jsonEvent('next_available', { port, range: [start, end] }));
    else console.log(port);
    return;
  }

  if (opts.ports.length === 0) {
    console.error('Usage: slay check <port> [port...] or slay check --next <port>');
    process.exit(1);
  }

  const adapter = platform(opts.protocol);
  const results = await checkPorts(adapter, opts.ports);

  if (opts.json) {
    for (const r of results) console.log(jsonEvent('check', { ...r }));
  } else {
    for (const r of results) {
      if (r.available) {
        console.log(`  ${c.green('free')}  ${r.port}`);
      } else {
        const detail =
          opts.verbose && r.command
            ? ` ${c.dim('>')} ${c.cyan(r.command)}${r.label ? c.dim(` (${r.label})`) : ''}`
            : '';
        console.log(`  ${c.red('used')}  ${r.port} ${c.dim(`PID ${r.pid}`)}${detail}`);
      }
    }
  }

  if (results.some((r) => !r.available)) process.exit(1);
}
