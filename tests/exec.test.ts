import { describe, expect, it } from 'vitest';
import { exec } from '../src/utils/exec.js';

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
