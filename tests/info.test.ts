import { describe, expect, it, vi } from 'vitest';

describe('getProcessDetail', () => {
  it('returns null when process not found', async () => {
    const { getProcessDetail } = await import('../src/platform/detail.js');
    const detail = await getProcessDetail(999999999);
    expect(detail).toBeNull();
  });

  it('returns detail for current process', async () => {
    const { getProcessDetail } = await import('../src/platform/detail.js');
    const detail = await getProcessDetail(process.pid);
    // Current process should be findable
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

    const { runInfo } = await import('../src/commands/info.js');
    await expect(runInfo([])).rejects.toThrow('process.exit');

    expect(consoleSpy.mock.calls[0][0]).toContain('Usage');
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('shows nothing listening for unused port', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runInfo } = await import('../src/commands/info.js');
    await runInfo([59998]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Nothing listening');
    consoleSpy.mockRestore();
  });
});
