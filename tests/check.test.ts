import { createServer } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runCheck } from '../src/commands/check.js';
import { checkPort, checkPorts, findNextAvailable, isPortFree } from '../src/core/check.js';
import { setPlatform } from '../src/platform/index.js';
import type { CliOptions } from '../src/types.js';
import { mockAdapter } from './helpers.js';

describe('checkPort', () => {
  it('returns available when no process on port', async () => {
    const adapter = mockAdapter();
    const result = await checkPort(adapter, 3000);
    expect(result).toEqual({ port: 3000, available: true });
  });

  it('returns occupied with process details', async () => {
    const adapter = mockAdapter({
      findByPort: vi.fn(async () => [
        { pid: 100, port: 3000, state: 'LISTEN', command: 'node', label: 'Node.js' },
      ]),
    });
    const result = await checkPort(adapter, 3000);
    expect(result).toEqual({
      port: 3000,
      available: false,
      pid: 100,
      command: 'node',
      label: 'Node.js',
    });
  });
});

describe('checkPorts', () => {
  it('checks multiple ports', async () => {
    const adapter = mockAdapter({
      findByPort: vi.fn(async (port: number) => {
        if (port === 3000) return [{ pid: 100, port: 3000, state: 'LISTEN', command: 'node' }];
        return [];
      }),
    });
    const results = await checkPorts(adapter, [3000, 8080]);
    expect(results).toHaveLength(2);
    expect(results[0].available).toBe(false);
    expect(results[1].available).toBe(true);
  });
});

describe.skipIf(process.platform === 'win32')('isPortFree', () => {
  it('returns true for a free port', async () => {
    const result = await isPortFree(59876);
    expect(result).toBe(true);
  });

  it('returns false for an occupied port', async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(59877, '127.0.0.1', resolve));
    try {
      const result = await isPortFree(59877);
      expect(result).toBe(false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe.skipIf(process.platform === 'win32')('findNextAvailable', () => {
  it('finds the first free port', async () => {
    const port = await findNextAvailable(59870, 59880);
    expect(port).toBeGreaterThanOrEqual(59870);
    expect(port).toBeLessThanOrEqual(59880);
  });

  it('returns null when no free ports in range', async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(59878, '127.0.0.1', resolve));
    try {
      const result = await findNextAvailable(59878, 59878);
      expect(result).toBeNull();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe('runCheck', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseOpts: CliOptions = {
    ports: [],
    force: false,
    yes: false,
    soft: false,
    verbose: false,
    all: false,
    json: false,
    watch: false,
    interactive: false,
    dryRun: false,
    tree: false,
    protocol: 'tcp',
    help: false,
    subArgs: [],
    command: 'check',
  };

  it('shows usage when no ports and no --next', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runCheck({ ...baseOpts })).rejects.toThrow('process.exit');
    expect(errorSpy).toHaveBeenCalledWith(
      'Usage: slay check <port> [port...] or slay check --next <port>',
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('displays free ports in text mode', async () => {
    setPlatform(
      mockAdapter({
        findByPort: vi.fn(async () => []),
      }),
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCheck({ ...baseOpts, ports: [59999] });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('free');
    expect(output).toContain('59999');
  });

  it('displays occupied ports in JSON mode and exits 1', async () => {
    setPlatform(
      mockAdapter({
        findByPort: vi.fn(async () => [{ pid: 100, port: 3000, state: 'LISTEN', command: 'node' }]),
      }),
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runCheck({ ...baseOpts, ports: [3000], json: true })).rejects.toThrow(
      'process.exit',
    );
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.type).toBe('check');
    expect(parsed.available).toBe(false);
  });

  it('displays occupied port in verbose text mode', async () => {
    setPlatform(
      mockAdapter({
        findByPort: vi.fn(async () => [
          { pid: 100, port: 3000, state: 'LISTEN', command: 'node', label: 'Node.js' },
        ]),
      }),
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runCheck({ ...baseOpts, ports: [3000], verbose: true })).rejects.toThrow(
      'process.exit',
    );
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('used');
    expect(output).toContain('node');
    expect(output).toContain('Node.js');
  });

  it('displays occupied port in verbose mode without label', async () => {
    setPlatform(
      mockAdapter({
        findByPort: vi.fn(async () => [
          { pid: 100, port: 3000, state: 'LISTEN', command: 'myapp' },
        ]),
      }),
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runCheck({ ...baseOpts, ports: [3000], verbose: true })).rejects.toThrow(
      'process.exit',
    );
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('used');
    expect(output).toContain('myapp');
  });

  it('displays occupied port in non-verbose text mode', async () => {
    setPlatform(
      mockAdapter({
        findByPort: vi.fn(async () => [{ pid: 100, port: 3000, state: 'LISTEN', command: 'node' }]),
      }),
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(runCheck({ ...baseOpts, ports: [3000] })).rejects.toThrow('process.exit');
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('used');
    expect(output).toContain('3000');
  });

  it.skipIf(process.platform === 'win32')('handles --next with single port', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCheck({ ...baseOpts, subArgs: ['next:59870'] });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    // Should print a port number
    expect(Number.parseInt(output.trim(), 10)).toBeGreaterThanOrEqual(59870);
  });

  it.skipIf(process.platform === 'win32')('handles --next with range', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCheck({ ...baseOpts, subArgs: ['next:59870-59880'] });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    const port = Number.parseInt(output.trim(), 10);
    expect(port).toBeGreaterThanOrEqual(59870);
    expect(port).toBeLessThanOrEqual(59880);
  });

  it.skipIf(process.platform === 'win32')('handles --next with range in JSON mode', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCheck({ ...baseOpts, subArgs: ['next:59870-59880'], json: true });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.type).toBe('next_available');
    expect(parsed.port).toBeGreaterThanOrEqual(59870);
  });

  it.skipIf(process.platform === 'win32')(
    'handles --next with no free ports in text mode',
    async () => {
      const server = createServer();
      await new Promise<void>((resolve) => server.listen(59879, '127.0.0.1', resolve));

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      try {
        await expect(runCheck({ ...baseOpts, subArgs: ['next:59879-59879'] })).rejects.toThrow(
          'process.exit',
        );
        const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
        expect(output).toContain('No free port found');
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  );

  it.skipIf(process.platform === 'win32')(
    'handles --next with no free ports in JSON mode',
    async () => {
      const server = createServer();
      await new Promise<void>((resolve) => server.listen(59879, '127.0.0.1', resolve));

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      try {
        await expect(
          runCheck({ ...baseOpts, subArgs: ['next:59879-59879'], json: true }),
        ).rejects.toThrow('process.exit');
        const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
        const parsed = JSON.parse(output);
        expect(parsed.type).toBe('next_available');
        expect(parsed.port).toBeNull();
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  );
});
