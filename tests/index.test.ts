import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const isWindows = process.platform === 'win32';

function run(args: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`node dist/index.js ${args}`, {
      encoding: 'utf8',
      timeout: 10_000,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    return { stdout, stderr: '', code: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      code: err.status ?? 1,
    };
  }
}

describe('CLI integration', () => {
  it('shows help with --help', () => {
    const { stdout, code } = run('--help');
    expect(code).toBe(0);
    expect(stdout).toContain('slay');
    expect(stdout).toContain('--force');
  });

  it('shows help with -h', () => {
    const { stdout, code } = run('-h');
    expect(code).toBe(0);
    expect(stdout).toContain('Usage');
  });

  it('reports nothing on unused port', () => {
    const { stdout, code } = run('59999');
    expect(code).toBe(0);
    expect(stdout).toContain('Nothing listening');
  });

  it('reports nothing in JSON mode on unused port', () => {
    const { stdout, code } = run('59999 --json');
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout.trim());
    expect(parsed.type).toBe('summary');
    expect(parsed.total).toBe(0);
  });

  it('fails with no args', () => {
    const { stderr, code } = run('');
    expect(code).toBe(1);
    expect(stderr).toContain('No ports specified');
  });

  it('fails with invalid port', () => {
    const { stderr, code } = run('99999');
    expect(code).toBe(1);
    expect(stderr).toContain('Invalid port');
  });

  it('fails with unknown option', () => {
    const { stderr, code } = run('--bogus');
    expect(code).toBe(1);
    expect(stderr).toContain('Unknown option');
  });

  it('--dry-run shows preview without killing', () => {
    const { stdout, code } = run('59999 --dry-run');
    expect(code).toBe(0);
    expect(stdout).toContain('Nothing listening');
  });

  // Skip on Windows: --all discovers real processes via netstat which can hang
  it.skipIf(isWindows)('--all with --json returns summary', () => {
    const { stdout, code } = run('--all --json -y');
    const lines = stdout.trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    expect(last.type).toBe('summary');
    expect(typeof last.total).toBe('number');
  });
});
