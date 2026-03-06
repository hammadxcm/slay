import { describe, expect, it } from 'vitest';
import { enrichLabel, getSystemPortWarning, isSystemPort } from '../src/core/labels.js';

describe('enrichLabel', () => {
  it('labels node process on known port', () => {
    const result = enrichLabel({ pid: 1, port: 3000, state: 'LISTEN', command: 'node' });
    expect(result.label).toBe('Node.js / Dev Server');
  });

  it('labels python on known port', () => {
    const result = enrichLabel({ pid: 2, port: 5000, state: 'LISTEN', command: 'python3' });
    expect(result.label).toBe('Python / Flask/Vite');
  });

  it('labels known command on unknown port', () => {
    const result = enrichLabel({ pid: 3, port: 9999, state: 'LISTEN', command: 'nginx' });
    expect(result.label).toBe('Nginx');
  });

  it('uses command name for unknown commands', () => {
    const result = enrichLabel({ pid: 3, port: 9999, state: 'LISTEN', command: 'myapp' });
    expect(result.label).toBe('myapp');
  });

  it('labels by port only when no command', () => {
    const result = enrichLabel({ pid: 4, port: 5432, state: 'LISTEN' });
    expect(result.label).toBe('PostgreSQL');
  });

  it('preserves existing label', () => {
    const result = enrichLabel({ pid: 5, port: 3000, state: 'LISTEN', label: 'Custom' });
    expect(result.label).toBe('Custom');
  });

  it('returns undefined label for unknown command and port', () => {
    const result = enrichLabel({ pid: 6, port: 12345, state: 'LISTEN' });
    expect(result.label).toBeUndefined();
  });

  it('does not duplicate label when command name matches port label', () => {
    // Redis on port 6379 — should not say "Redis / Redis"
    const result = enrichLabel({ pid: 7, port: 6379, state: 'LISTEN', command: 'redis-server' });
    expect(result.label).toBe('Redis');
  });

  it('handles command with path prefix', () => {
    const result = enrichLabel({ pid: 8, port: 3000, state: 'LISTEN', command: '/usr/bin/node' });
    expect(result.label).toBe('Node.js / Dev Server');
  });

  it('labels all known commands', () => {
    const knownCommands: [string, string][] = [
      ['python', 'Python'],
      ['ruby', 'Ruby'],
      ['java', 'Java'],
      ['apache2', 'Apache'],
      ['httpd', 'Apache'],
      ['postgres', 'PostgreSQL'],
      ['mysqld', 'MySQL'],
      ['mongod', 'MongoDB'],
      ['redis', 'Redis'],
      ['docker', 'Docker'],
      ['docker-proxy', 'Docker'],
      ['code', 'VS Code'],
      ['Electron', 'Electron'],
      ['php', 'PHP'],
      ['go', 'Go'],
      ['deno', 'Deno'],
      ['bun', 'Bun'],
    ];

    for (const [cmd, expected] of knownCommands) {
      const result = enrichLabel({ pid: 100, port: 12345, state: 'LISTEN', command: cmd });
      expect(result.label).toBe(expected);
    }
  });

  it('labels all known ports', () => {
    const knownPorts: [number, string][] = [
      [80, 'HTTP'],
      [443, 'HTTPS'],
      [3001, 'Dev Server'],
      [4200, 'Angular'],
      [5173, 'Vite'],
      [3306, 'MySQL'],
      [8080, 'HTTP Alt'],
      [8443, 'HTTPS Alt'],
      [8888, 'Jupyter'],
      [9090, 'Prometheus'],
      [27017, 'MongoDB'],
    ];

    for (const [port, expected] of knownPorts) {
      const result = enrichLabel({ pid: 100, port, state: 'LISTEN' });
      expect(result.label).toBe(expected);
    }
  });

  it('handles empty command string', () => {
    const result = enrichLabel({ pid: 10, port: 12345, state: 'LISTEN', command: '' });
    expect(result.label).toBeUndefined();
  });

  it('handles command that is just a slash', () => {
    const result = enrichLabel({ pid: 11, port: 12345, state: 'LISTEN', command: '/' });
    expect(result.label).toBe('/');
  });
});

describe('isSystemPort', () => {
  it('returns true for well-known system ports', () => {
    expect(isSystemPort(22)).toBe(true);
    expect(isSystemPort(53)).toBe(true);
    expect(isSystemPort(80)).toBe(true);
    expect(isSystemPort(443)).toBe(true);
  });

  it('returns true for ports below 1024', () => {
    expect(isSystemPort(1)).toBe(true);
    expect(isSystemPort(1023)).toBe(true);
  });

  it('returns false for non-system ports', () => {
    expect(isSystemPort(3000)).toBe(false);
    expect(isSystemPort(8080)).toBe(false);
    expect(isSystemPort(1024)).toBe(false);
  });
});

describe('getSystemPortWarning', () => {
  it('returns warnings for system ports', () => {
    const procs = [
      { pid: 1, port: 80, state: 'LISTEN', command: 'nginx' },
      { pid: 2, port: 3000, state: 'LISTEN', command: 'node' },
    ];
    const warnings = getSystemPortWarning(procs);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('80');
    expect(warnings[0]).toContain('nginx');
  });

  it('returns empty for non-system ports', () => {
    const procs = [{ pid: 1, port: 3000, state: 'LISTEN', command: 'node' }];
    expect(getSystemPortWarning(procs)).toHaveLength(0);
  });

  it('handles process without command', () => {
    const procs = [{ pid: 1, port: 22, state: 'LISTEN' }];
    const warnings = getSystemPortWarning(procs);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('22');
  });
});
