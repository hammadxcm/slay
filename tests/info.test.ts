import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/core/discovery.js', () => ({
  findByPorts: vi.fn(),
}));
vi.mock('../src/platform/detail.js', () => ({
  getProcessDetail: vi.fn(),
}));
vi.mock('../src/platform/index.js', () => ({
  platform: vi.fn(() => ({})),
}));
vi.mock('../src/core/tree.js', () => ({
  findChildren: vi.fn(),
}));

import { runInfo } from '../src/commands/info.js';
import { findByPorts } from '../src/core/discovery.js';
import { findChildren } from '../src/core/tree.js';
import { getProcessDetail } from '../src/platform/detail.js';

describe('getProcessDetail (real)', () => {
  it('returns null when process not found', async () => {
    const { getProcessDetail: realGetProcessDetail } = await vi.importActual<
      typeof import('../src/platform/detail.js')
    >('../src/platform/detail.js');
    const detail = await realGetProcessDetail(999999999);
    expect(detail).toBeNull();
  });

  it('returns detail for current process', async () => {
    const { getProcessDetail: realGetProcessDetail } = await vi.importActual<
      typeof import('../src/platform/detail.js')
    >('../src/platform/detail.js');
    const detail = await realGetProcessDetail(process.pid);
    if (process.platform !== 'win32') {
      expect(detail).not.toBeNull();
      expect(detail?.cpu).toBeDefined();
      expect(detail?.memory).toBeDefined();
      expect(detail?.user).toBeDefined();
      expect(detail?.uptime).toBeDefined();
    }
  });
});

describe('runInfo', () => {
  it('exits with error when no ports given', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runInfo([])).rejects.toThrow('process.exit');

    expect(consoleSpy.mock.calls[0][0]).toContain('Usage');
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('shows nothing listening for unused port', async () => {
    vi.mocked(findByPorts).mockResolvedValue([]);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runInfo([59998]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Nothing listening');
    consoleSpy.mockRestore();
  });

  it('displays process details when processes are found', async () => {
    vi.mocked(findByPorts).mockResolvedValue([
      { pid: 1234, port: 3000, state: 'LISTEN', command: 'node', label: 'Node.js' },
    ]);
    vi.mocked(getProcessDetail).mockResolvedValue({
      cpu: '2.5%',
      memory: '50MB',
      user: 'testuser',
      uptime: '5m 30s',
    });
    vi.mocked(findChildren).mockResolvedValue([5678]);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runInfo([3000]);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('3000');
    expect(output).toContain('1234');
    expect(output).toContain('node');
    consoleSpy.mockRestore();
  });

  it('displays process with no detail and no children', async () => {
    vi.mocked(findByPorts).mockResolvedValue([{ pid: 1234, port: 3000, state: 'LISTEN' }]);
    vi.mocked(getProcessDetail).mockResolvedValue(null);
    vi.mocked(findChildren).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runInfo([3000]);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('3000');
    expect(output).toContain('1234');
    consoleSpy.mockRestore();
  });

  it('handles findChildren throwing an error', async () => {
    vi.mocked(findByPorts).mockResolvedValue([
      { pid: 1234, port: 3000, state: 'LISTEN', command: 'node' },
    ]);
    vi.mocked(getProcessDetail).mockResolvedValue({
      cpu: '1%',
      memory: '20MB',
      user: 'root',
      uptime: '1h',
    });
    vi.mocked(findChildren).mockRejectedValue(new Error('no children'));

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runInfo([3000]);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('3000');
    consoleSpy.mockRestore();
  });

  it('displays child processes with null detail', async () => {
    vi.mocked(findByPorts).mockResolvedValue([
      { pid: 1234, port: 3000, state: 'LISTEN', command: 'node' },
    ]);
    vi.mocked(getProcessDetail)
      .mockResolvedValueOnce({ cpu: '1%', memory: '20MB', user: 'root', uptime: '1h' }) // parent
      .mockResolvedValueOnce(null); // child has no detail
    vi.mocked(findChildren).mockResolvedValue([5678]);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runInfo([3000]);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('5678');
    consoleSpy.mockRestore();
  });
});
