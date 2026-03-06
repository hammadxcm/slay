import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/exec.js', () => ({
  exec: vi.fn(),
}));

import { findChildren, findDescendants } from '../src/core/tree.js';
import { exec } from '../src/utils/exec.js';
import { withMockPlatform, withMockPlatformAsync } from './helpers.js';

const mockedExec = vi.mocked(exec);

describe('findChildren', () => {
  it('parses pgrep output on unix', async () => {
    mockedExec.mockResolvedValue({ stdout: '2000\n2001\n', stderr: '' });
    const children = await findChildren(1000);
    expect(children).toEqual([2000, 2001]);
  });

  it('parses wmic output on win32', async () => {
    mockedExec.mockResolvedValue({
      stdout: 'Node,ProcessId\nMYPC,2000\nMYPC,2001\n',
      stderr: '',
    });
    await withMockPlatformAsync('win32', async () => {
      const children = await findChildren(1000);
      expect(children).toEqual([2000, 2001]);
      expect(mockedExec).toHaveBeenCalledWith(
        'wmic process where (ParentProcessId=1000) get ProcessId /format:csv 2>nul',
      );
    });
  });

  it('filters out parent pid from wmic output', async () => {
    mockedExec.mockResolvedValue({
      stdout: 'Node,ProcessId\nMYPC,1000\nMYPC,2000\n',
      stderr: '',
    });
    await withMockPlatformAsync('win32', async () => {
      const children = await findChildren(1000);
      expect(children).toEqual([2000]);
    });
  });

  it('handles empty wmic lines', async () => {
    mockedExec.mockResolvedValue({
      stdout: '\n\n',
      stderr: '',
    });
    await withMockPlatformAsync('win32', async () => {
      const children = await findChildren(1000);
      expect(children).toEqual([]);
    });
  });

  it('returns empty on error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const children = await findChildren(1000);
    expect(children).toEqual([]);
  });

  it('handles empty output', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const children = await findChildren(1000);
    expect(children).toEqual([]);
  });
});

describe('findDescendants', () => {
  it('returns children depth-first', async () => {
    // pid 1000 has child 2000, which has child 3000
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('1000')) return { stdout: '2000\n', stderr: '' };
      if (cmd.includes('2000')) return { stdout: '3000\n', stderr: '' };
      return { stdout: '', stderr: '' };
    });
    const descendants = await findDescendants(1000);
    // depth-first: grandchild before child
    expect(descendants).toEqual([3000, 2000]);
  });

  it('returns empty for leaf process', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const descendants = await findDescendants(1000);
    expect(descendants).toEqual([]);
  });
});
