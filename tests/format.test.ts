import { describe, expect, it } from 'vitest';
import type { KillResult, ProcessInfo } from '../src/types.js';
import {
  formatDryRunSummary,
  formatProcessList,
  formatResult,
  formatSummary,
  jsonDryRun,
  jsonEvent,
  jsonFound,
  jsonResult,
  jsonSummary,
} from '../src/ui/format.js';

describe('formatProcessList', () => {
  it('returns empty string for no processes', () => {
    expect(formatProcessList([])).toBe('');
  });

  it('formats a process with command and label', () => {
    const procs: ProcessInfo[] = [
      { pid: 100, port: 3000, state: 'LISTEN', command: 'node', label: 'Node.js' },
    ];
    const result = formatProcessList(procs);
    expect(result).toContain('3000');
    expect(result).toContain('node');
    expect(result).toContain('100');
    expect(result).toContain('Node.js');
  });

  it('shows "unknown" when no command', () => {
    const procs: ProcessInfo[] = [{ pid: 200, port: 8080, state: 'LISTEN' }];
    const result = formatProcessList(procs);
    expect(result).toContain('unknown');
  });

  it('omits label parenthetical when no label', () => {
    const procs: ProcessInfo[] = [{ pid: 200, port: 8080, state: 'LISTEN', command: 'myapp' }];
    const result = formatProcessList(procs);
    expect(result).toContain('myapp');
    // Should NOT contain parenthetical label
    expect(result).not.toContain('(');
  });

  it('formats multiple processes', () => {
    const procs: ProcessInfo[] = [
      { pid: 100, port: 3000, state: 'LISTEN', command: 'node' },
      { pid: 200, port: 8080, state: 'LISTEN', command: 'nginx' },
    ];
    const result = formatProcessList(procs);
    expect(result).toContain('3000');
    expect(result).toContain('8080');
  });

  it('shows protocol in verbose mode', () => {
    const procs: ProcessInfo[] = [
      { pid: 100, port: 3000, state: 'LISTEN', command: 'node', protocol: 'tcp' },
    ];
    const result = formatProcessList(procs, true);
    expect(result).toContain('TCP');
  });

  it('does not show protocol when not verbose', () => {
    const procs: ProcessInfo[] = [
      { pid: 100, port: 3000, state: 'LISTEN', command: 'node', protocol: 'tcp' },
    ];
    const result = formatProcessList(procs);
    expect(result).not.toContain('[TCP]');
  });

  it('handles verbose mode with no protocol set', () => {
    const procs: ProcessInfo[] = [{ pid: 100, port: 3000, state: 'LISTEN', command: 'node' }];
    const result = formatProcessList(procs, true);
    expect(result).toContain('3000');
    expect(result).not.toContain('[TCP]');
  });

  it('shows N/A for port 0', () => {
    const procs: ProcessInfo[] = [{ pid: 100, port: 0, state: 'RUNNING', command: 'node' }];
    const result = formatProcessList(procs);
    expect(result).toContain('N/A');
    expect(result).not.toContain(' 0 ');
  });
});

describe('formatResult', () => {
  it('formats a successful kill', () => {
    const result: KillResult = { pid: 100, port: 3000, success: true, signal: 'SIGKILL' };
    const output = formatResult(result);
    expect(output).toContain('killed');
    expect(output).toContain('100');
    expect(output).toContain('3000');
    expect(output).toContain('SIGKILL');
  });

  it('formats a failed kill with error', () => {
    const result: KillResult = {
      pid: 100,
      port: 3000,
      success: false,
      signal: 'FAILED',
      error: 'Permission denied',
    };
    const output = formatResult(result);
    expect(output).toContain('failed');
    expect(output).toContain('Permission denied');
  });

  it('formats a failed kill without error', () => {
    const result: KillResult = { pid: 100, port: 3000, success: false, signal: 'FAILED' };
    const output = formatResult(result);
    expect(output).toContain('unknown error');
  });

  it('shows elapsed time in verbose mode', () => {
    const result: KillResult = {
      pid: 100,
      port: 3000,
      success: true,
      signal: 'SIGKILL',
      elapsed: 42,
    };
    const output = formatResult(result, true);
    expect(output).toContain('42ms');
  });

  it('does not show elapsed time when not verbose', () => {
    const result: KillResult = {
      pid: 100,
      port: 3000,
      success: true,
      signal: 'SIGKILL',
      elapsed: 42,
    };
    const output = formatResult(result);
    expect(output).not.toContain('42ms');
  });

  it('shows 0ms elapsed when elapsed is undefined in verbose mode', () => {
    const result: KillResult = { pid: 100, port: 3000, success: true, signal: 'SIGKILL' };
    const output = formatResult(result, true);
    expect(output).toContain('0ms');
  });

  it('omits port display when port is 0', () => {
    const result: KillResult = { pid: 100, port: 0, success: true, signal: 'SIGKILL' };
    const output = formatResult(result);
    expect(output).toContain('killed');
    expect(output).toContain('100');
    expect(output).not.toContain('on port');
  });
});

describe('formatSummary', () => {
  it('formats all killed', () => {
    const results: KillResult[] = [
      { pid: 100, port: 3000, success: true, signal: 'SIGKILL' },
      { pid: 200, port: 8080, success: true, signal: 'SIGKILL' },
    ];
    const output = formatSummary(results);
    expect(output).toContain('2 killed');
    expect(output).not.toContain('failed');
  });

  it('formats all failed', () => {
    const results: KillResult[] = [
      { pid: 100, port: 3000, success: false, signal: 'FAILED', error: 'err' },
    ];
    const output = formatSummary(results);
    expect(output).toContain('1 failed');
    expect(output).not.toContain('killed');
  });

  it('formats mixed results', () => {
    const results: KillResult[] = [
      { pid: 100, port: 3000, success: true, signal: 'SIGKILL' },
      { pid: 200, port: 8080, success: false, signal: 'FAILED' },
    ];
    const output = formatSummary(results);
    expect(output).toContain('1 killed');
    expect(output).toContain('1 failed');
  });

  it('handles empty results', () => {
    const output = formatSummary([]);
    // Should not contain "killed" or "failed" text
    expect(output).not.toContain('killed');
    expect(output).not.toContain('failed');
  });
});

describe('jsonEvent', () => {
  it('creates a JSON string with type and data', () => {
    const result = JSON.parse(jsonEvent('test', { foo: 'bar' }));
    expect(result.type).toBe('test');
    expect(result.foo).toBe('bar');
  });
});

describe('jsonFound', () => {
  it('creates found event with process info', () => {
    const proc: ProcessInfo = {
      pid: 100,
      port: 3000,
      state: 'LISTEN',
      command: 'node',
      label: 'Node.js',
    };
    const result = JSON.parse(jsonFound(proc));
    expect(result.type).toBe('found');
    expect(result.pid).toBe(100);
    expect(result.port).toBe(3000);
    expect(result.command).toBe('node');
    expect(result.label).toBe('Node.js');
  });

  it('handles missing optional fields', () => {
    const proc: ProcessInfo = { pid: 100, port: 3000, state: 'LISTEN' };
    const result = JSON.parse(jsonFound(proc));
    expect(result.command).toBeUndefined();
    expect(result.label).toBeUndefined();
  });
});

describe('jsonResult', () => {
  it('creates killed event on success', () => {
    const kill: KillResult = { pid: 100, port: 3000, success: true, signal: 'SIGKILL' };
    const result = JSON.parse(jsonResult(kill));
    expect(result.type).toBe('killed');
    expect(result.success).toBe(true);
  });

  it('creates failed event on failure', () => {
    const kill: KillResult = {
      pid: 100,
      port: 3000,
      success: false,
      signal: 'FAILED',
      error: 'err',
    };
    const result = JSON.parse(jsonResult(kill));
    expect(result.type).toBe('failed');
    expect(result.error).toBe('err');
  });
});

describe('jsonSummary', () => {
  it('creates summary event', () => {
    const results: KillResult[] = [
      { pid: 100, port: 3000, success: true, signal: 'SIGKILL' },
      { pid: 200, port: 8080, success: false, signal: 'FAILED' },
    ];
    const summary = JSON.parse(jsonSummary(results));
    expect(summary.type).toBe('summary');
    expect(summary.killed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.total).toBe(2);
  });

  it('handles empty results', () => {
    const summary = JSON.parse(jsonSummary([]));
    expect(summary.killed).toBe(0);
    expect(summary.failed).toBe(0);
    expect(summary.total).toBe(0);
  });
});

describe('formatDryRunSummary', () => {
  it('formats dry run for single process', () => {
    const procs: ProcessInfo[] = [{ pid: 100, port: 3000, state: 'LISTEN' }];
    const output = formatDryRunSummary(procs);
    expect(output).toContain('dry run');
    expect(output).toContain('1');
    expect(output).toContain('100');
    expect(output).toContain('process');
    expect(output).not.toContain('processes');
  });

  it('formats dry run for multiple processes', () => {
    const procs: ProcessInfo[] = [
      { pid: 100, port: 3000, state: 'LISTEN' },
      { pid: 200, port: 8080, state: 'LISTEN' },
    ];
    const output = formatDryRunSummary(procs);
    expect(output).toContain('2');
    expect(output).toContain('processes');
  });
});

describe('jsonDryRun', () => {
  it('creates dry_run event', () => {
    const procs: ProcessInfo[] = [{ pid: 100, port: 3000, state: 'LISTEN', command: 'node' }];
    const result = JSON.parse(jsonDryRun(procs));
    expect(result.type).toBe('dry_run');
    expect(result.count).toBe(1);
    expect(result.processes[0].pid).toBe(100);
  });
});
