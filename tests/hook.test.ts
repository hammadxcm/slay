import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

const mockedSpawn = vi.mocked(spawn);

import { runHook } from '../src/core/hook.js';

function createMockChild(): ChildProcess {
  const emitter = new EventEmitter();
  return emitter as unknown as ChildProcess;
}

describe('runHook', () => {
  it('returns success when command exits with code 0', async () => {
    const child = createMockChild();
    mockedSpawn.mockReturnValue(child);

    const promise = runHook('echo hello');
    child.emit('close', 0);
    const result = await promise;

    expect(result).toEqual({ command: 'echo hello', exitCode: 0, success: true });
    expect(mockedSpawn).toHaveBeenCalledWith('echo hello', {
      shell: true,
      stdio: 'inherit',
    });
  });

  it('returns failure when command exits with non-zero code', async () => {
    const child = createMockChild();
    mockedSpawn.mockReturnValue(child);

    const promise = runHook('exit 1');
    child.emit('close', 1);
    const result = await promise;

    expect(result).toEqual({ command: 'exit 1', exitCode: 1, success: false });
  });

  it('handles null exit code', async () => {
    const child = createMockChild();
    mockedSpawn.mockReturnValue(child);

    const promise = runHook('some-cmd');
    child.emit('close', null);
    const result = await promise;

    expect(result).toEqual({ command: 'some-cmd', exitCode: 0, success: true });
  });

  it('returns failure on spawn error', async () => {
    const child = createMockChild();
    mockedSpawn.mockReturnValue(child);

    const promise = runHook('bad-cmd');
    child.emit('error', new Error('ENOENT'));
    const result = await promise;

    expect(result).toEqual({ command: 'bad-cmd', exitCode: 1, success: false });
  });

  it('uses pipe stdio in json mode', async () => {
    const child = createMockChild();
    mockedSpawn.mockReturnValue(child);

    const promise = runHook('echo test', true);
    child.emit('close', 0);
    await promise;

    expect(mockedSpawn).toHaveBeenCalledWith('echo test', {
      shell: true,
      stdio: 'pipe',
    });
  });
});
