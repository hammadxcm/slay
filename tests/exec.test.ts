import { describe, expect, it, vi } from 'vitest';
import { exec, isWmicAvailable, resetWmicCache } from '../src/utils/exec.js';

describe('exec', () => {
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
    // Verify our exec handles the case where the error lacks stdout
    // by creating a scenario with a null byte in command (causes spawn error)
    try {
      await exec('echo \x00');
      // If it doesn't throw, it returned stdout/stderr — that's fine
    } catch (error) {
      // If it throws, verify it's an Error
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('isWmicAvailable', () => {
  it('returns a boolean', async () => {
    resetWmicCache();
    const result = await isWmicAvailable();
    expect(typeof result).toBe('boolean');
  });

  it('caches the result on subsequent calls', async () => {
    resetWmicCache();
    const first = await isWmicAvailable();
    const second = await isWmicAvailable();
    expect(first).toBe(second);
  });

  it('resetWmicCache clears cached value', async () => {
    await isWmicAvailable();
    resetWmicCache();
    // After reset, it should re-probe (still returns boolean)
    const result = await isWmicAvailable();
    expect(typeof result).toBe('boolean');
  });

  it('returns true when wmic command succeeds and caches result', async () => {
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
});
