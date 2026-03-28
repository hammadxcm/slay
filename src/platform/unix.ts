import { matchesPattern } from '../core/filter.js';
import type { PlatformAdapter, ProcessInfo, Protocol } from '../types.js';
import { KillErrorCode, SlayError, isPermissionError } from '../utils/errors.js';
import { exec } from '../utils/exec.js';
import { deduplicateByPid } from './parse-utils.js';

function parseLsofLine(line: string): ProcessInfo | null {
  // lsof output: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
  const parts = line.trim().split(/\s+/);
  if (parts.length < 10) return null;

  const command = parts[0];
  const pid = Number.parseInt(parts[1], 10);
  // NAME field may be "*:3000 (LISTEN)" — try last part first, then second-to-last
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  const portMatch = last.match(/:(\d+)$/) || secondLast?.match(/:(\d+)$/);
  if (!portMatch || Number.isNaN(pid) || pid === 0) return null;

  return {
    pid,
    port: Number.parseInt(portMatch[1], 10),
    state: 'LISTEN',
    command,
  };
}

export function createUnixAdapter(protocol: Protocol = 'tcp'): PlatformAdapter {
  const isUdp = protocol === 'udp';

  return {
    async findByPort(port: number): Promise<ProcessInfo[]> {
      try {
        const cmd = isUdp
          ? `lsof -iUDP:${port} -n -P 2>/dev/null`
          : `lsof -iTCP:${port} -sTCP:LISTEN -n -P 2>/dev/null`;
        const { stdout, stderr } = await exec(cmd);
        if (stderr && isPermissionError(stderr)) {
          throw new SlayError(KillErrorCode.PERMISSION_DENIED, `port ${port}`);
        }
        const lines = stdout.trim().split('\n').slice(1); // skip header
        return deduplicateByPid(lines, parseLsofLine, protocol);
      } catch (error) {
        if (error instanceof SlayError) throw error;
        return [];
      }
    },

    async findAllListening(): Promise<ProcessInfo[]> {
      try {
        const cmd = isUdp
          ? 'lsof -iUDP -n -P 2>/dev/null'
          : 'lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null';
        const { stdout } = await exec(cmd);
        const lines = stdout.trim().split('\n').slice(1);
        return deduplicateByPid(lines, parseLsofLine, protocol);
      } catch {
        return [];
      }
    },

    async findByName(pattern: string): Promise<ProcessInfo[]> {
      try {
        const { stdout } = await exec('ps axo pid,comm');
        return stdout
          .trim()
          .split(/\r?\n/)
          .slice(1) // skip header
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            const pid = Number.parseInt(parts[0], 10);
            const command = parts.slice(1).join(' ');
            return { pid, command };
          })
          .filter((p) => !Number.isNaN(p.pid) && p.pid > 0 && matchesPattern(p.command, pattern))
          .map((p) => ({ pid: p.pid, port: 0, state: 'RUNNING', command: p.command }));
      } catch {
        return [];
      }
    },

    async kill(pid: number, signal: 'SIGTERM' | 'SIGKILL'): Promise<boolean> {
      const sig = signal === 'SIGKILL' ? '-9' : '-15';
      try {
        const { stderr } = await exec(`kill ${sig} ${pid}`);
        if (stderr && isPermissionError(stderr)) {
          throw new SlayError(KillErrorCode.PERMISSION_DENIED, `PID ${pid}`);
        }
        return true;
      } catch (error) {
        if (error instanceof SlayError) throw error;
        return false;
      }
    },

    async isAlive(pid: number): Promise<boolean> {
      try {
        const { stdout } = await exec(`kill -0 ${pid} 2>/dev/null && echo alive`);
        return stdout.trim() === 'alive';
      } catch {
        return false;
      }
    },
  };
}

export const unix: PlatformAdapter = createUnixAdapter('tcp');
