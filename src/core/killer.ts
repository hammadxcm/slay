import type { KillResult, PlatformAdapter, ProcessInfo } from '../types.js';
import { KillErrorCode, SlayError } from '../utils/errors.js';
import { findDescendants } from './tree.js';

const KILL_WAIT_MS = 1500;
const POLL_INTERVAL_MS = 100;

async function waitForDeath(
  adapter: PlatformAdapter,
  pid: number,
  timeout: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!(await adapter.isAlive(pid))) return true;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return !(await adapter.isAlive(pid));
}

export async function killProcess(
  adapter: PlatformAdapter,
  proc: ProcessInfo,
  options: { force?: boolean; soft?: boolean },
): Promise<KillResult> {
  const { pid, port } = proc;

  // Already dead? Count as success.
  if (!(await adapter.isAlive(pid))) {
    return { pid, port, success: true, signal: 'ALREADY_DEAD' };
  }

  const start = Date.now();

  try {
    if (options.force) {
      // Force: SIGKILL immediately
      const ok = await adapter.kill(pid, 'SIGKILL');
      return { pid, port, success: ok, signal: 'SIGKILL', elapsed: Date.now() - start };
    }

    if (options.soft) {
      // Soft: SIGTERM first, escalate to SIGKILL
      await adapter.kill(pid, 'SIGTERM');
      const died = await waitForDeath(adapter, pid, KILL_WAIT_MS);
      if (died) {
        return { pid, port, success: true, signal: 'SIGTERM', elapsed: Date.now() - start };
      }
      const ok = await adapter.kill(pid, 'SIGKILL');
      return { pid, port, success: ok, signal: 'SIGKILL (escalated)', elapsed: Date.now() - start };
    }

    // Default: SIGKILL
    const ok = await adapter.kill(pid, 'SIGKILL');
    return { pid, port, success: ok, signal: 'SIGKILL', elapsed: Date.now() - start };
  } catch (error) {
    if (error instanceof SlayError && error.code === KillErrorCode.PERMISSION_DENIED) {
      return { pid, port, success: false, signal: 'FAILED', error: error.message };
    }
    return {
      pid,
      port,
      success: false,
      signal: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function killPid(
  adapter: PlatformAdapter,
  pid: number,
  signal: 'SIGTERM' | 'SIGKILL',
): Promise<boolean> {
  try {
    return await adapter.kill(pid, signal);
  } catch {
    return false;
  }
}

async function killTree(
  adapter: PlatformAdapter,
  proc: ProcessInfo,
  options: { force?: boolean; soft?: boolean },
): Promise<KillResult> {
  const signal: 'SIGTERM' | 'SIGKILL' = options.force ? 'SIGKILL' : 'SIGTERM';
  const descendants = await findDescendants(proc.pid);

  // Kill children depth-first (already ordered by findDescendants)
  for (const childPid of descendants) {
    await killPid(adapter, childPid, signal);
  }

  // Kill the parent
  return killProcess(adapter, proc, options);
}

export async function killAll(
  adapter: PlatformAdapter,
  processes: ProcessInfo[],
  options: { force?: boolean; soft?: boolean; tree?: boolean },
): Promise<KillResult[]> {
  if (options.tree) {
    return Promise.all(processes.map((proc) => killTree(adapter, proc, options)));
  }
  return Promise.all(processes.map((proc) => killProcess(adapter, proc, options)));
}
