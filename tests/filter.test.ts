import { describe, expect, it } from 'vitest';
import { excludeProcesses, matchesPattern } from '../src/core/filter.js';
import type { ProcessInfo } from '../src/types.js';

describe('matchesPattern', () => {
  it('matches plain substring (case-insensitive)', () => {
    expect(matchesPattern('node', 'node')).toBe(true);
    expect(matchesPattern('Node.js', 'node')).toBe(true);
  });

  it('returns false for non-matching pattern', () => {
    expect(matchesPattern('nginx', 'node')).toBe(false);
  });

  it('returns false for undefined command', () => {
    expect(matchesPattern(undefined, 'node')).toBe(false);
  });

  it('matches regex pattern', () => {
    expect(matchesPattern('node-server', '^node')).toBe(true);
    expect(matchesPattern('my-node-app', '^node')).toBe(false);
  });

  it('falls back to substring when regex is invalid', () => {
    expect(matchesPattern('node(app)', 'node(app')).toBe(true);
    expect(matchesPattern('nginx', 'node(app')).toBe(false);
  });

  it('matches case-insensitively', () => {
    expect(matchesPattern('MyApp', 'myapp')).toBe(true);
  });
});

describe('excludeProcesses', () => {
  const processes: ProcessInfo[] = [
    { pid: 1, port: 3000, state: 'LISTEN', command: 'node' },
    { pid: 2, port: 8080, state: 'LISTEN', command: 'nginx' },
    { pid: 3, port: 5432, state: 'LISTEN', command: 'postgres' },
  ];

  it('excludes matching processes', () => {
    const result = excludeProcesses(processes, ['node']);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.command)).toEqual(['nginx', 'postgres']);
  });

  it('excludes multiple patterns', () => {
    const result = excludeProcesses(processes, ['node', 'nginx']);
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('postgres');
  });

  it('returns all when no pattern matches', () => {
    const result = excludeProcesses(processes, ['redis']);
    expect(result).toHaveLength(3);
  });

  it('handles empty patterns array', () => {
    const result = excludeProcesses(processes, []);
    expect(result).toHaveLength(3);
  });

  it('handles process without command', () => {
    const procs: ProcessInfo[] = [{ pid: 4, port: 9999, state: 'LISTEN' }];
    const result = excludeProcesses(procs, ['node']);
    expect(result).toHaveLength(1);
  });
});
