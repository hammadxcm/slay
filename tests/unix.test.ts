import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/exec.js', () => ({
  exec: vi.fn(),
}));

import { createUnixAdapter, unix } from '../src/platform/unix.js';
import { KillErrorCode, SlayError } from '../src/utils/errors.js';
import { exec } from '../src/utils/exec.js';

const mockedExec = vi.mocked(exec);

const LSOF_HEADER = 'COMMAND   PID   USER   FD   TYPE   DEVICE   SIZE/OFF   NODE   NAME';
const LSOF_LINE = 'node      1234  user   12u  IPv4   0x1234   0t0        TCP    *:3000 (LISTEN)';
const LSOF_LINE_2 = 'nginx     5678  root   6u   IPv6   0x5678   0t0        TCP    *:8080 (LISTEN)';

describe('unix.findByPort', () => {
  it('parses lsof output', async () => {
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${LSOF_LINE}`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result).toEqual([
      { pid: 1234, port: 3000, state: 'LISTEN', command: 'node', protocol: 'tcp' },
    ]);
  });

  it('deduplicates by PID', async () => {
    mockedExec.mockResolvedValue({
      stdout: `${LSOF_HEADER}\n${LSOF_LINE}\n${LSOF_LINE}`,
      stderr: '',
    });
    const result = await unix.findByPort(3000);
    expect(result).toHaveLength(1);
  });

  it('returns empty for no output', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await unix.findByPort(9999);
    expect(result).toEqual([]);
  });

  it('returns empty on exec error (non-SlayError)', async () => {
    mockedExec.mockRejectedValue(new Error('command failed'));
    const result = await unix.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('throws SlayError on permission denied', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: 'Operation not permitted' });
    await expect(unix.findByPort(80)).rejects.toThrow(SlayError);
  });

  it('skips lines with too few parts', async () => {
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\nshort line`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips lines without port match', async () => {
    const noPort = 'node      1234  user   12u  IPv4   0x1234   0t0        TCP    *:noport';
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${noPort}`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips lines with PID 0', async () => {
    const pid0 = 'node      0     user   12u  IPv4   0x1234   0t0        TCP    *:3000 (LISTEN)';
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${pid0}`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result).toEqual([]);
  });

  it('skips lines with NaN pid', async () => {
    const badPid = 'node      NaN   user   12u  IPv4   0x1234   0t0        TCP    *:3000 (LISTEN)';
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${badPid}`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result).toEqual([]);
  });
});

describe('unix.findAllListening', () => {
  it('parses multiple processes', async () => {
    mockedExec.mockResolvedValue({
      stdout: `${LSOF_HEADER}\n${LSOF_LINE}\n${LSOF_LINE_2}`,
      stderr: '',
    });
    const result = await unix.findAllListening();
    expect(result).toHaveLength(2);
    expect(result[0].port).toBe(3000);
    expect(result[1].port).toBe(8080);
  });

  it('deduplicates by PID', async () => {
    mockedExec.mockResolvedValue({
      stdout: `${LSOF_HEADER}\n${LSOF_LINE}\n${LSOF_LINE}`,
      stderr: '',
    });
    const result = await unix.findAllListening();
    expect(result).toHaveLength(1);
  });

  it('returns empty on error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const result = await unix.findAllListening();
    expect(result).toEqual([]);
  });

  it('returns empty for empty output', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await unix.findAllListening();
    expect(result).toEqual([]);
  });
});

describe('unix.kill', () => {
  it('sends SIGKILL with -9', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await unix.kill(1234, 'SIGKILL');
    expect(result).toBe(true);
    expect(mockedExec).toHaveBeenCalledWith('kill -9 1234');
  });

  it('sends SIGTERM with -15', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const result = await unix.kill(1234, 'SIGTERM');
    expect(result).toBe(true);
    expect(mockedExec).toHaveBeenCalledWith('kill -15 1234');
  });

  it('throws SlayError on permission denied', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: 'Permission denied' });
    await expect(unix.kill(1234, 'SIGKILL')).rejects.toThrow(SlayError);
  });

  it('returns false on other errors', async () => {
    mockedExec.mockRejectedValue(new Error('No such process'));
    const result = await unix.kill(1234, 'SIGKILL');
    expect(result).toBe(false);
  });

  it('re-throws SlayError from exec', async () => {
    mockedExec.mockRejectedValue(new SlayError(KillErrorCode.PERMISSION_DENIED));
    await expect(unix.kill(1234, 'SIGKILL')).rejects.toThrow(SlayError);
  });
});

describe('unix.isAlive', () => {
  it('returns true when process is alive', async () => {
    mockedExec.mockResolvedValue({ stdout: 'alive\n', stderr: '' });
    expect(await unix.isAlive(1234)).toBe(true);
  });

  it('returns false when process is dead', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    expect(await unix.isAlive(1234)).toBe(false);
  });

  it('returns false on error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    expect(await unix.isAlive(1234)).toBe(false);
  });
});

describe('unix.findByName', () => {
  it('parses ps output and matches pattern', async () => {
    const PS_OUTPUT = 'PID   COMM\n  1234 node\n  5678 nginx\n  9012 node-worker';
    mockedExec.mockResolvedValue({ stdout: PS_OUTPUT, stderr: '' });
    const result = await unix.findByName('node');
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((p) => p.port === 0)).toBe(true);
    expect(result.every((p) => p.state === 'RUNNING')).toBe(true);
  });

  it('returns empty on exec error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const result = await unix.findByName('node');
    expect(result).toEqual([]);
  });

  it('returns empty when no match', async () => {
    const PS_OUTPUT = 'PID   COMM\n  1234 nginx';
    mockedExec.mockResolvedValue({ stdout: PS_OUTPUT, stderr: '' });
    const result = await unix.findByName('node');
    expect(result).toEqual([]);
  });

  it('skips lines with PID 0 or NaN', async () => {
    const PS_OUTPUT = 'PID   COMM\n  0 kernel\n  NaN bad';
    mockedExec.mockResolvedValue({ stdout: PS_OUTPUT, stderr: '' });
    const result = await unix.findByName('kernel');
    expect(result).toEqual([]);
  });
});

describe('createUnixAdapter (UDP)', () => {
  it('uses lsof -iUDP for findByPort', async () => {
    const udp = createUnixAdapter('udp');
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${LSOF_LINE}`, stderr: '' });
    const result = await udp.findByPort(3000);
    expect(mockedExec).toHaveBeenCalledWith('lsof -iUDP:3000 -n -P 2>/dev/null');
    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('udp');
  });

  it('uses lsof -iUDP for findAllListening', async () => {
    const udp = createUnixAdapter('udp');
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${LSOF_LINE}`, stderr: '' });
    await udp.findAllListening();
    expect(mockedExec).toHaveBeenCalledWith('lsof -iUDP -n -P 2>/dev/null');
  });

  it('sets protocol to tcp by default', async () => {
    mockedExec.mockResolvedValue({ stdout: `${LSOF_HEADER}\n${LSOF_LINE}`, stderr: '' });
    const result = await unix.findByPort(3000);
    expect(result[0].protocol).toBe('tcp');
  });
});
