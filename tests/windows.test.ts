import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/exec.js', () => ({
  exec: vi.fn(),
}));

import { createWindowsAdapter, windows } from '../src/platform/windows.js';
import { KillErrorCode, SlayError } from '../src/utils/errors.js';
import { exec } from '../src/utils/exec.js';

const mockedExec = vi.mocked(exec);

const NETSTAT_LISTENING = '  TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    1234';
const NETSTAT_LISTENING_2 = '  TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    5678';
const NETSTAT_ESTABLISHED = '  TCP    0.0.0.0:3000    1.2.3.4:5    ESTABLISHED  9999';

function mockNetstat(lines: string[]) {
  mockedExec.mockImplementation(async (cmd: string) => {
    if (cmd.startsWith('netstat')) {
      return { stdout: lines.join('\n'), stderr: '' };
    }
    if (cmd.startsWith('tasklist /FI')) {
      return { stdout: '"node.exe","1234","Console","1","12,345 K"', stderr: '' };
    }
    return { stdout: '', stderr: '' };
  });
}

describe('windows.findByPort', () => {
  it('parses netstat output and gets process name', async () => {
    mockNetstat([NETSTAT_LISTENING]);
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(1234);
    expect(result[0].port).toBe(3000);
    expect(result[0].command).toBe('node.exe');
  });

  it('filters by port', async () => {
    mockNetstat([NETSTAT_LISTENING, NETSTAT_LISTENING_2]);
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(3000);
  });

  it('ignores non-LISTENING lines', async () => {
    mockNetstat([NETSTAT_ESTABLISHED]);
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(0);
  });

  it('deduplicates by PID', async () => {
    mockNetstat([NETSTAT_LISTENING, NETSTAT_LISTENING]);
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(1);
  });

  it('returns empty on exec error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const result = await windows.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips lines with too few parts', async () => {
    mockNetstat(['short']);
    const result = await windows.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips lines without port match', async () => {
    mockNetstat(['  TCP    noport    0.0.0.0:0    LISTENING    1234']);
    const result = await windows.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips PID 0', async () => {
    mockNetstat(['  TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    0']);
    const result = await windows.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips NaN PID', async () => {
    mockNetstat(['  TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    abc']);
    const result = await windows.findByPort(3000);
    expect(result).toEqual([]);
  });
});

describe('windows.findAllListening', () => {
  it('returns all listening processes', async () => {
    mockNetstat([NETSTAT_LISTENING, NETSTAT_LISTENING_2]);
    const result = await windows.findAllListening();
    expect(result).toHaveLength(2);
  });

  it('deduplicates by PID', async () => {
    mockNetstat([NETSTAT_LISTENING, NETSTAT_LISTENING]);
    const result = await windows.findAllListening();
    expect(result).toHaveLength(1);
  });

  it('returns empty on error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const result = await windows.findAllListening();
    expect(result).toEqual([]);
  });
});

describe('windows.kill', () => {
  it('runs taskkill /F for SIGKILL', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await windows.kill(1234, 'SIGKILL');
    expect(result).toBe(true);
    expect(mockedExec).toHaveBeenCalledWith('taskkill /PID 1234 /F');
  });

  it('runs taskkill without /F for SIGTERM', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await windows.kill(1234, 'SIGTERM');
    expect(result).toBe(true);
    expect(mockedExec).toHaveBeenCalledWith('taskkill /PID 1234');
  });

  it('throws SlayError on permission denied', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: 'Access Denied' });
    await expect(windows.kill(1234, 'SIGKILL')).rejects.toThrow(SlayError);
  });

  it('returns false on other errors', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const result = await windows.kill(1234, 'SIGKILL');
    expect(result).toBe(false);
  });

  it('re-throws SlayError from exec', async () => {
    mockedExec.mockRejectedValue(new SlayError(KillErrorCode.PERMISSION_DENIED));
    await expect(windows.kill(1234, 'SIGKILL')).rejects.toThrow(SlayError);
  });
});

describe('windows.isAlive', () => {
  it('returns true when process exists', async () => {
    mockedExec.mockResolvedValue({ stdout: '"node.exe","1234","Console"', stderr: '' });
    expect(await windows.isAlive(1234)).toBe(true);
  });

  it('returns false when no tasks found', async () => {
    mockedExec.mockResolvedValue({ stdout: 'INFO: No tasks are running', stderr: '' });
    expect(await windows.isAlive(1234)).toBe(false);
  });

  it('returns false on error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    expect(await windows.isAlive(1234)).toBe(false);
  });
});

describe('createWindowsAdapter (UDP)', () => {
  it('uses netstat -p UDP for findByPort', async () => {
    const NETSTAT_UDP = '  UDP    0.0.0.0:5353    *:*                            1234';
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: NETSTAT_UDP, stderr: '' };
      }
      if (cmd.startsWith('tasklist /FI')) {
        return { stdout: '"mdns.exe","1234","Console","1","12,345 K"', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    const udp = createWindowsAdapter('udp');
    const result = await udp.findByPort(5353);
    expect(mockedExec).toHaveBeenCalledWith('netstat -ano -p UDP');
    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('udp');
  });

  it('skips LISTENING check for UDP', async () => {
    // UDP lines don't have a LISTENING state
    const NETSTAT_UDP = '  UDP    0.0.0.0:5353    *:*                            1234';
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: NETSTAT_UDP, stderr: '' };
      }
      return { stdout: '"mdns.exe","1234","Console","1","12,345 K"', stderr: '' };
    });
    const udp = createWindowsAdapter('udp');
    const result = await udp.findAllListening();
    expect(result).toHaveLength(1);
  });

  it('skips short UDP lines', async () => {
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: 'too short', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    const udp = createWindowsAdapter('udp');
    const result = await udp.findByPort(5353);
    expect(result).toEqual([]);
  });

  it('skips UDP lines without port match', async () => {
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: '  UDP    noport    *:*    1234', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    const udp = createWindowsAdapter('udp');
    const result = await udp.findByPort(5353);
    expect(result).toEqual([]);
  });

  it('skips UDP lines with PID 0', async () => {
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: '  UDP    0.0.0.0:5353    *:*    0', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    const udp = createWindowsAdapter('udp');
    const result = await udp.findByPort(5353);
    expect(result).toEqual([]);
  });
});

describe('getProcessName (via findByPort)', () => {
  it('handles tasklist failure gracefully', async () => {
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: NETSTAT_LISTENING, stderr: '' };
      }
      // tasklist fails
      throw new Error('fail');
    });
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(1);
    expect(result[0].command).toBeUndefined();
  });

  it('handles tasklist with no match', async () => {
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('netstat')) {
        return { stdout: NETSTAT_LISTENING, stderr: '' };
      }
      return { stdout: 'no match here', stderr: '' };
    });
    const result = await windows.findByPort(3000);
    expect(result).toHaveLength(1);
    expect(result[0].command).toBeUndefined();
  });
});
