import { describe, expect, it, vi } from 'vitest';
import { exec, isWmicAvailable, resetWmicCache } from '../src/utils/exec.js';

describe.skipIf(process.platform === 'win32')('exec', () => {
  it('runs a simple command', async () => {
    const { stdout } = await exec('echo hello');
    expect(stdout.trim()).toBe('hello');
  });

  it('returns stderr', async () => {
    const { stderr } = await exec('echo err >&2');
    expect(stderr.trim()).toBe('err');
  });

  it('returns stdout from non-zero exit code commands', async () => {
    const { stdout } = await exec('echo found && exit 1');
    expect(stdout.trim()).toBe('found');
  });

  it('returns stderr from non-zero exit code commands', async () => {
    const { stderr } = await exec('nonexistent_command_xyz_123');
    expect(stderr).toContain('not found');
  });

  it('throws on timeout', async () => {
    await expect(exec('sleep 10', 100)).rejects.toThrow('timed out');
  });

  it('uses default timeout of 10s', async () => {
    const { stdout } = await exec('echo fast');
    expect(stdout.trim()).toBe('fast');
  });

  it('re-throws errors without stdout property', async () => {
    try {
      await exec('echo \x00');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('isWmicAvailable', () => {
  it('returns true when wmic succeeds and caches result', async () => {
    vi.resetModules();

    let execCallCount = 0;
    vi.doMock('node:child_process', () => ({
      exec: (
        _cmd: string,
        _opts: unknown,
        cb: (err: null, result: { stdout: string; stderr: string }) => void,
      ) => {
        execCallCount++;
        cb(null, { stdout: 'Caption\nMicrosoft Windows 10', stderr: '' });
        return {} as unknown;
      },
    }));

    const { isWmicAvailable: mockedIsWmic, resetWmicCache: mockedReset } = await import(
      '../src/utils/exec.js'
    );
    mockedReset();
    execCallCount = 0;

    const result = await mockedIsWmic();
    expect(result).toBe(true);

    // Second call should use cache, not call exec again
    const cached = await mockedIsWmic();
    expect(cached).toBe(true);
    expect(execCallCount).toBe(1);

    // After reset, next call should re-probe
    mockedReset();
    const reprobed = await mockedIsWmic();
    expect(reprobed).toBe(true);
    expect(execCallCount).toBe(2);

    vi.resetModules();
  });

  it('returns false when wmic fails and caches result', async () => {
    vi.resetModules();

    let execCallCount = 0;
    vi.doMock('node:child_process', () => ({
      exec: (_cmd: string, _opts: unknown, cb: (err: Error) => void) => {
        execCallCount++;
        cb(new Error('wmic not found'));
        return {} as unknown;
      },
    }));

    const { isWmicAvailable: mockedIsWmic, resetWmicCache: mockedReset } = await import(
      '../src/utils/exec.js'
    );
    mockedReset();
    execCallCount = 0;

    const result = await mockedIsWmic();
    expect(result).toBe(false);

    // Cached
    const cached = await mockedIsWmic();
    expect(cached).toBe(false);
    expect(execCallCount).toBe(1);

    // Reset clears cache
    mockedReset();
    const reprobed = await mockedIsWmic();
    expect(reprobed).toBe(false);
    expect(execCallCount).toBe(2);

    vi.resetModules();
  });
});
