import { matchesPattern } from '../core/filter.js';
import type { PlatformAdapter, ProcessInfo, Protocol } from '../types.js';
import { KillErrorCode, SlayError, isPermissionError } from '../utils/errors.js';
import { exec } from '../utils/exec.js';
import { deduplicateByPid } from './parse-utils.js';

function parseNetstatLine(line: string, requireListening = true): ProcessInfo | null {
  // TCP output: Proto Local_Address Foreign_Address State PID (5+ parts)
  // UDP output: Proto Local_Address Foreign_Address PID (4+ parts, no State)
  const parts = line.trim().split(/\s+/);

  if (requireListening) {
    // TCP mode: need State column
    if (parts.length < 5) return null;
    if (parts[3] !== 'LISTENING') return null;
    const localAddr = parts[1];
    const portMatch = localAddr.match(/:(\d+)$/);
    if (!portMatch) return null;
    const pid = Number.parseInt(parts[4], 10);
    if (Number.isNaN(pid) || pid === 0) return null;
    return { pid, port: Number.parseInt(portMatch[1], 10), state: 'LISTENING' };
  }

  // UDP mode: no State column, PID is last field
  if (parts.length < 4) return null;
  const localAddr = parts[1];
  const portMatch = localAddr.match(/:(\d+)$/);
  if (!portMatch) return null;
  const pid = Number.parseInt(parts[parts.length - 1], 10);
  if (Number.isNaN(pid) || pid === 0) return null;
  return { pid, port: Number.parseInt(portMatch[1], 10), state: 'UDP' };
}

async function getProcessName(pid: number): Promise<string | undefined> {
  try {
    const { stdout } = await exec(`tasklist /FI "PID eq ${pid}" /FO CSV /NH 2>nul`);
    const match = stdout.match(/"([^"]+)"/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export function createWindowsAdapter(protocol: Protocol = 'tcp'): PlatformAdapter {
  const isUdp = protocol === 'udp';
  const netstatProto = isUdp ? 'UDP' : 'TCP';

  return {
    async findByPort(port: number): Promise<ProcessInfo[]> {
      try {
        const { stdout } = await exec(`netstat -ano -p ${netstatProto}`);
        const lines = stdout.trim().split(/\r?\n/);
        const parseLine = (line: string) => {
          const info = parseNetstatLine(line, !isUdp);
          return info && info.port === port ? info : null;
        };
        const results = deduplicateByPid(lines, parseLine, protocol);
        for (const info of results) {
          info.command = await getProcessName(info.pid);
        }
        return results;
      } catch {
        return [];
      }
    },

    async findAllListening(): Promise<ProcessInfo[]> {
      try {
        const { stdout } = await exec(`netstat -ano -p ${netstatProto}`);
        const lines = stdout.trim().split(/\r?\n/);
        const results = deduplicateByPid(lines, (line) => parseNetstatLine(line, !isUdp), protocol);
        for (const info of results) {
          info.command = await getProcessName(info.pid);
        }
        return results;
      } catch {
        return [];
      }
    },

    async findByName(pattern: string): Promise<ProcessInfo[]> {
      try {
        const { stdout } = await exec('tasklist /FO CSV /NH 2>nul');
        return stdout
          .trim()
          .split(/\r?\n/)
          .map((line) => {
            const match = line.match(/"([^"]+)","(\d+)"/);
            if (!match) return null;
            return { command: match[1], pid: Number.parseInt(match[2], 10) };
          })
          .filter(
            (p): p is { command: string; pid: number } =>
              p !== null && !Number.isNaN(p.pid) && p.pid > 0 && matchesPattern(p.command, pattern),
          )
          .map((p) => ({ pid: p.pid, port: 0, state: 'RUNNING', command: p.command }));
      } catch {
        return [];
      }
    },

    async kill(pid: number, signal: 'SIGTERM' | 'SIGKILL'): Promise<boolean> {
      try {
        const cmd = signal === 'SIGKILL' ? `taskkill /PID ${pid} /F` : `taskkill /PID ${pid}`;
        const { stderr } = await exec(cmd);
        if (stderr) {
          if (isPermissionError(stderr)) {
            throw new SlayError(KillErrorCode.PERMISSION_DENIED, `PID ${pid}`);
          }
          if (/not found/i.test(stderr)) {
            return true;
          }
          if (/could not be terminated/i.test(stderr)) {
            return false;
          }
        }
        return true;
      } catch (error) {
        if (error instanceof SlayError) throw error;
        const err = error as { stderr?: string };
        if (err.stderr && isPermissionError(err.stderr)) {
          throw new SlayError(KillErrorCode.PERMISSION_DENIED, `PID ${pid}`);
        }
        return false;
      }
    },

    async isAlive(pid: number): Promise<boolean> {
      try {
        const { stdout } = await exec(`tasklist /FI "PID eq ${pid}" /NH`);
        return !stdout.includes('No tasks');
      } catch {
        return false;
      }
    },
  };
}

export const windows: PlatformAdapter = createWindowsAdapter('tcp');
