import { parseArgs, showHelp, validateOptions } from './cli.js';
import { runInfo } from './commands/info.js';
import { runInit } from './commands/init.js';
import { runProfile } from './commands/profile.js';
import { findConfig, loadConfig, mergeProfileOpts, resolveProfile } from './config.js';
import { findAllListening, findByName, findByPorts } from './core/discovery.js';
import { excludeProcesses } from './core/filter.js';
import { killAll } from './core/killer.js';
import { getSystemPortWarning } from './core/labels.js';
import { platform } from './platform/index.js';
import type { ProcessInfo } from './types.js';
import { playKillAnimation } from './ui/animation.js';
import { c, isTTY } from './ui/colors.js';
import {
  formatDryRunSummary,
  formatProcessList,
  formatResult,
  formatSummary,
  jsonDryRun,
  jsonEvent,
  jsonFound,
  jsonResult,
  jsonSummary,
} from './ui/format.js';
import { selectProcesses } from './ui/interactive.js';
import { confirm } from './ui/prompt.js';
import { SlayError } from './utils/errors.js';

async function run(): Promise<void> {
  let opts = parseArgs(process.argv);

  // Handle subcommands
  if (opts.command === 'init') {
    await runInit();
    return;
  }
  if (opts.command === 'profile') {
    await runProfile(opts.subArgs);
    return;
  }
  if (opts.command === 'info') {
    await runInfo(opts.ports);
    return;
  }
  if (opts.command === 'completions') {
    const { generateCompletion } = await import('./completions/index.js');
    const shell = opts.subArgs[0];
    if (!shell) {
      console.error('Usage: slay completions <bash|zsh|fish>');
      process.exit(1);
    }
    try {
      console.log(generateCompletion(shell));
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
    return;
  }
  if (opts.command === '_list-profile-names') {
    const configPath = findConfig();
    if (configPath) {
      const config = loadConfig(configPath);
      for (const name of Object.keys(config.profiles)) {
        console.log(name);
      }
    }
    return;
  }
  if (opts.command === 'check') {
    const { runCheck } = await import('./commands/check.js');
    await runCheck(opts);
    return;
  }

  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  // Merge profile if specified
  if (opts.profile) {
    const configPath = findConfig();
    if (!configPath) {
      throw new Error('No .slay.json found. Run slay init to create one.');
    }
    const config = loadConfig(configPath);
    const profileOpts = resolveProfile(config, opts.profile);
    opts = mergeProfileOpts(opts, profileOpts);
  }

  validateOptions(opts);

  const adapter = platform(opts.protocol);
  const isJson = opts.json;

  // Watch mode loop
  if (opts.watch) {
    await watchMode(adapter, opts);
    return;
  }

  // Discover processes
  let processes: ProcessInfo[];
  if (opts.all) {
    processes = await findAllListening(adapter);
  } else if (opts.interactive) {
    processes = await findAllListening(adapter);
    if (processes.length === 0) {
      if (isJson) console.log(jsonSummary([]));
      else console.log(`\n  ${c.dim('No listening processes found.')}\n`);
      return;
    }
    processes = await selectProcesses(processes);
    if (processes.length === 0) return;
  } else {
    processes = await findByPorts(adapter, opts.ports);
  }

  if (opts.name) {
    const byName = await findByName(adapter, opts.name);
    const existing = new Set(processes.map((p) => p.pid));
    for (const p of byName) {
      if (!existing.has(p.pid)) {
        processes.push(p);
        existing.add(p.pid);
      }
    }
  }
  if (opts.exclude) {
    processes = excludeProcesses(processes, opts.exclude);
  }

  if (processes.length === 0) {
    const portStr = opts.all ? 'any port' : `port ${opts.ports.join(', ')}`;
    if (isJson) console.log(jsonSummary([]));
    else console.log(`\n  ${c.dim(`Nothing listening on ${portStr}.`)}\n`);
    return;
  }

  // Display found processes
  if (isJson) {
    for (const p of processes) console.log(jsonFound(p));
  } else {
    console.log(`\n${formatProcessList(processes, opts.verbose)}\n`);
  }

  // Dry run: show what would be killed and exit
  if (opts.dryRun) {
    if (isJson) {
      console.log(jsonDryRun(processes));
    } else {
      console.log(formatDryRunSummary(processes));
    }
    return;
  }

  // Warn about system processes
  const systemWarnings = getSystemPortWarning(processes);
  if (systemWarnings.length > 0 && !isJson) {
    for (const w of systemWarnings) {
      console.log(`  ${c.yellow('warning')} ${w}`);
    }
    if (!opts.yes && !opts.force) {
      const ok = await confirm('  These are system ports. Continue?');
      if (!ok) {
        console.log(`  ${c.dim('Aborted.')}`);
        return;
      }
    }
  } else if (!opts.yes && !opts.force && !opts.interactive && !isJson) {
    // Confirm unless --yes or --force
    const ok = await confirm('  Kill?');
    if (!ok) {
      console.log(`  ${c.dim('Aborted.')}`);
      return;
    }
  }

  // Kill
  if (!isJson) await playKillAnimation();
  const results = await killAll(adapter, processes, {
    force: opts.force,
    soft: opts.soft,
    tree: opts.tree,
  });

  // Output results
  if (isJson) {
    for (const r of results) console.log(jsonResult(r));
    console.log(jsonSummary(results));
  } else {
    for (const r of results) console.log(formatResult(r, opts.verbose));
    console.log(formatSummary(results));
    console.log();
  }

  if (opts.thenRun && results.some((r) => r.success)) {
    if (!isJson) console.log(`\n  ${c.dim('Running:')} ${opts.thenRun}`);
    const { runHook } = await import('./core/hook.js');
    const hookResult = await runHook(opts.thenRun, isJson);
    if (isJson) {
      console.log(
        jsonEvent('hook', {
          command: hookResult.command,
          exitCode: hookResult.exitCode,
          success: hookResult.success,
        }),
      );
    } else if (!hookResult.success) {
      console.log(`  ${c.red('hook failed')} (exit ${hookResult.exitCode})`);
    }
  }

  const anyFailed = results.some((r) => !r.success);
  if (anyFailed) process.exit(1);
}

async function watchMode(
  adapter: ReturnType<typeof platform>,
  opts: ReturnType<typeof parseArgs>,
): Promise<void> {
  const isJson = opts.json;
  const ports = opts.ports;

  if (!isJson) {
    console.log(
      `\n  ${c.bold('Watch mode')} ${c.dim(`- polling port ${ports.join(', ')} every 2s (Ctrl+C to stop)`)}\n`,
    );
  }

  const seen = new Set<number>();

  const poll = async () => {
    const processes = await findByPorts(adapter, ports);
    const newProcs = processes.filter((p) => !seen.has(p.pid));

    if (newProcs.length === 0) return;

    for (const p of newProcs) {
      seen.add(p.pid);
      if (isJson) console.log(jsonFound(p));
    }

    const results = await killAll(adapter, newProcs, {
      force: opts.force,
      soft: opts.soft,
      tree: opts.tree,
    });

    for (const r of results) {
      if (isJson) console.log(jsonResult(r));
      else console.log(formatResult(r, opts.verbose));
    }

    if (opts.thenRun && results.some((r) => r.success)) {
      if (!isJson) console.log(`\n  ${c.dim('Running:')} ${opts.thenRun}`);
      const { runHook } = await import('./core/hook.js');
      const hookResult = await runHook(opts.thenRun, isJson);
      if (isJson) {
        console.log(
          jsonEvent('hook', {
            command: hookResult.command,
            exitCode: hookResult.exitCode,
            success: hookResult.success,
          }),
        );
      } else if (!hookResult.success) {
        console.log(`  ${c.red('hook failed')} (exit ${hookResult.exitCode})`);
      }
    }
  };

  // Initial poll
  await poll();

  // Keep polling
  const interval = setInterval(poll, 2000);

  process.on('SIGINT', () => {
    clearInterval(interval);
    if (!isJson) console.log(`\n  ${c.dim('Watch stopped.')}\n`);
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

run().catch((error) => {
  if (error instanceof SlayError) {
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify({ type: 'error', code: error.code, message: error.message }));
    } else {
      console.error(`\n  ${c.red(error.message)}\n`);
    }
    process.exit(1);
  }
  if (error instanceof Error) {
    console.error(`\n  ${c.red(error.message)}\n`);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
