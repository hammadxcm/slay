import type { KillResult, ProcessInfo } from '../types.js';
import { c } from './colors.js';

export function formatProcessList(processes: ProcessInfo[], verbose = false): string {
  if (processes.length === 0) return '';

  const lines = processes.map((p) => {
    const label = p.label ? c.dim(` (${p.label})`) : '';
    const cmd = p.command ? c.cyan(p.command) : c.dim('unknown');
    const portStr = p.port > 0 ? c.bold(String(p.port)) : c.dim('N/A');
    const base = `  ${portStr} ${c.dim('>')} ${cmd} ${c.dim(`PID ${p.pid}`)}${label}`;
    if (!verbose) return base;
    const protocol = p.protocol ? c.dim(` [${p.protocol.toUpperCase()}]`) : '';
    return `${base}${protocol}`;
  });

  return lines.join('\n');
}

export function formatResult(result: KillResult, verbose = false): string {
  if (result.success) {
    const portStr = result.port > 0 ? `on port ${c.bold(String(result.port))} ` : '';
    const base = `  ${c.green('killed')} PID ${c.bold(String(result.pid))} ${portStr}${c.dim(`[${result.signal}]`)}`;
    if (!verbose) return base;
    return `${base} ${c.dim(`(elapsed ${result.elapsed ?? 0}ms)`)}`;
  }
  return `  ${c.red('failed')} PID ${result.pid} on port ${result.port}: ${result.error || 'unknown error'}`;
}

export function formatSummary(results: KillResult[]): string {
  const killed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  const parts: string[] = [];
  if (killed > 0) parts.push(c.green(`${killed} killed`));
  if (failed > 0) parts.push(c.red(`${failed} failed`));

  return `\n  ${parts.join(c.dim(' / '))}`;
}

// --- JSON output ---

export function jsonEvent(type: string, data: Record<string, unknown>): string {
  return JSON.stringify({ type, ...data });
}

export function jsonFound(proc: ProcessInfo): string {
  return jsonEvent('found', {
    pid: proc.pid,
    port: proc.port,
    command: proc.command,
    label: proc.label,
  });
}

export function jsonResult(result: KillResult): string {
  return jsonEvent(result.success ? 'killed' : 'failed', {
    pid: result.pid,
    port: result.port,
    success: result.success,
    signal: result.signal,
    error: result.error,
  });
}

export function jsonSummary(results: KillResult[]): string {
  const killed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  return jsonEvent('summary', { killed, failed, total: results.length });
}

export function formatDryRunSummary(processes: ProcessInfo[]): string {
  const count = processes.length;
  const pids = processes.map((p) => p.pid).join(', ');
  return `\n  ${c.yellow('dry run')} — would kill ${c.bold(String(count))} process${count === 1 ? '' : 'es'} (PID ${pids})\n`;
}

export function jsonDryRun(processes: ProcessInfo[]): string {
  return jsonEvent('dry_run', {
    count: processes.length,
    processes: processes.map((p) => ({ pid: p.pid, port: p.port, command: p.command })),
  });
}
