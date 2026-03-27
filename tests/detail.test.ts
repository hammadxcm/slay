import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/exec.js', () => ({
  exec: vi.fn(),
  isWmicAvailable: vi.fn(async () => true),
}));

import { getProcessDetail } from '../src/platform/detail.js';
import { exec, isWmicAvailable } from '../src/utils/exec.js';
import { withMockPlatformAsync } from './helpers.js';

const mockedExec = vi.mocked(exec);
const mockedIsWmicAvailable = vi.mocked(isWmicAvailable);

describe('getProcessDetail (windows wmic)', () => {
  it('parses wmic csv output', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\nMYPC,node.exe,5,104857600\n',
          stderr: '',
        };
      }
      if (cmd.includes('get /format:csv')) {
        return { stdout: 'DOMAIN\\myuser', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.cpu).toBe('5%');
      expect(detail?.memory).toBe('100MB');
      expect(detail?.user).toBe('myuser');
    });
  });

  it('parses wmic output with \\r\\n', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\r\nMYPC,node.exe,10,52428800\r\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.cpu).toBe('10%');
      expect(detail?.memory).toBe('50MB');
    });
  });

  it('returns null on insufficient wmic output', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockResolvedValue({ stdout: 'header only\n', stderr: '' });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });

  it('returns null on insufficient csv columns', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockResolvedValue({
      stdout: 'header\nshort,row\n',
      stderr: '',
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });

  it('handles NaN working set size', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\nMYPC,node.exe,0,notanumber\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail?.memory).toBe('0KB');
    });
  });

  it('handles empty cpu field', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\nMYPC,node.exe,,1048576\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail?.cpu).toBe('0%');
    });
  });

  it('handles user lookup failure gracefully', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\nMYPC,node.exe,5,1048576\n',
          stderr: '',
        };
      }
      throw new Error('wmic user lookup failed');
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.user).toBe('');
    });
  });

  it('handles user output with no domain match', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('PercentProcessorTime')) {
        return {
          stdout: 'Node,Name,PercentProcessorTime,WorkingSetSize\nMYPC,node.exe,5,1048576\n',
          stderr: '',
        };
      }
      return { stdout: 'no domain match here', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail?.user).toBe('');
    });
  });

  it('returns null on exec error', async () => {
    mockedIsWmicAvailable.mockResolvedValue(true);
    mockedExec.mockRejectedValue(new Error('fail'));
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });
});

describe('getProcessDetail (windows PowerShell fallback)', () => {
  it('parses PowerShell csv output', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('Get-Process')) {
        return {
          stdout: '"CPU","WorkingSet64"\n"12.5","104857600"\n',
          stderr: '',
        };
      }
      if (cmd.includes('GetOwner')) {
        return { stdout: 'myuser\n', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.cpu).toBe('12.5s');
      expect(detail?.memory).toBe('100MB');
      expect(detail?.user).toBe('myuser');
    });
  });

  it('parses PowerShell output with \\r\\n', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('Get-Process')) {
        return {
          stdout: '"CPU","WorkingSet64"\r\n"5.0","52428800"\r\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.cpu).toBe('5.0s');
      expect(detail?.memory).toBe('50MB');
    });
  });

  it('returns null on insufficient PowerShell output', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockResolvedValue({ stdout: '"header"\n', stderr: '' });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });

  it('returns null on insufficient csv columns from PowerShell', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockResolvedValue({
      stdout: '"CPU","WorkingSet64"\n"onlyonecol"\n',
      stderr: '',
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });

  it('handles NaN working set from PowerShell', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('Get-Process')) {
        return {
          stdout: '"CPU","WorkingSet64"\n"0","notanumber"\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail?.memory).toBe('0KB');
    });
  });

  it('handles NaN cpu from PowerShell', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('Get-Process')) {
        return {
          stdout: '"CPU","WorkingSet64"\n"","1048576"\n',
          stderr: '',
        };
      }
      return { stdout: '', stderr: '' };
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail?.cpu).toBe('0.0s');
    });
  });

  it('handles owner lookup failure gracefully', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockImplementation(async (cmd: string) => {
      if (cmd.includes('Get-Process')) {
        return {
          stdout: '"CPU","WorkingSet64"\n"1","1048576"\n',
          stderr: '',
        };
      }
      throw new Error('owner lookup failed');
    });
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).not.toBeNull();
      expect(detail?.user).toBe('');
    });
  });

  it('returns null on exec error', async () => {
    mockedIsWmicAvailable.mockResolvedValue(false);
    mockedExec.mockRejectedValue(new Error('fail'));
    await withMockPlatformAsync('win32', async () => {
      const detail = await getProcessDetail(1234);
      expect(detail).toBeNull();
    });
  });
});

describe('getProcessDetail (unix)', () => {
  it('returns null on empty output', async () => {
    mockedExec.mockResolvedValue({ stdout: '', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail).toBeNull();
  });

  it('returns null on insufficient columns', async () => {
    mockedExec.mockResolvedValue({ stdout: '1.0 1024', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail).toBeNull();
  });

  it('parses ps output correctly', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 2.5 51200 root 1:30:45', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail).not.toBeNull();
    expect(detail?.cpu).toBe('2.5%');
    expect(detail?.memory).toBe('50MB');
    expect(detail?.user).toBe('root');
    expect(detail?.uptime).toBe('1h 30m');
  });

  it('formats memory in GB', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1073741824 user 0:05', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.memory).toBe('1024.0GB');
  });

  it('formats memory in KB', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 500 user 0:05', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.memory).toBe('500KB');
  });

  it('handles NaN rss', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 notnum user 0:05', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.memory).toBe('notnum');
  });

  it('formats day uptime', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user 2-05:30:00', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('2d 5h');
  });

  it('formats day uptime with 0 days', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user 0-05:30:00', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('5h 30m');
  });

  it('formats mm:ss uptime with 0 minutes', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user 0:45', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('45s');
  });

  it('formats mm:ss uptime', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user 5:30', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('5m 30s');
  });

  it('formats hh:mm:ss with 0 hours', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user 0:30:15', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('30m 15s');
  });

  it('returns raw uptime for unrecognized format', async () => {
    mockedExec.mockResolvedValue({ stdout: ' 1.0 1024 user unknown', stderr: '' });
    const detail = await getProcessDetail(1234);
    expect(detail?.uptime).toBe('unknown');
  });

  it('returns null on exec error', async () => {
    mockedExec.mockRejectedValue(new Error('fail'));
    const detail = await getProcessDetail(1234);
    expect(detail).toBeNull();
  });
});
