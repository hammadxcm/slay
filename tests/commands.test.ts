import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../src/config.js';

describe('init command', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-init-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('creates .slay.json with default profiles', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runInit } = await import('../src/commands/init.js');
    await runInit();
    const configPath = join(tempDir, '.slay.json');
    expect(existsSync(configPath)).toBe(true);
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.profiles.dev).toBeDefined();
    expect(config.profiles.clean).toBeDefined();
    expect(config.profiles.api).toBeDefined();
    spy.mockRestore();
  });

  it('warns if .slay.json already exists', async () => {
    writeFileSync(join(tempDir, '.slay.json'), '{"profiles":{}}');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runInit } = await import('../src/commands/init.js');
    await runInit();
    expect(spy.mock.calls.some((call) => call[0]?.includes('already exists'))).toBe(true);
    spy.mockRestore();
  });
});

describe('profile list', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-profile-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('lists profiles from config', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({ profiles: { dev: { ports: [3000], soft: true } } }),
    );
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('dev');
    spy.mockRestore();
  });

  it('shows message when no config found', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No .slay.json found');
    spy.mockRestore();
  });
});

describe('profile rm', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-profile-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('removes a profile', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({ profiles: { dev: { ports: [3000] }, prod: { ports: [8080] } } }),
    );
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['rm', 'dev']);
    const config = JSON.parse(readFileSync(join(tempDir, '.slay.json'), 'utf-8'));
    expect(config.profiles.dev).toBeUndefined();
    expect(config.profiles.prod).toBeDefined();
    spy.mockRestore();
  });
});
