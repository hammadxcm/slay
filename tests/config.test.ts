import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CONFIG,
  findConfig,
  loadConfig,
  mergeProfileOpts,
  resolveProfile,
  saveConfig,
} from '../src/config.js';
import type { CliOptions, ProfileOptions } from '../src/types.js';

describe('findConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-config-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('finds .slay.json in the given directory', () => {
    const configPath = join(tempDir, '.slay.json');
    writeFileSync(configPath, '{"profiles":{}}');
    expect(findConfig(tempDir)).toBe(configPath);
  });

  it('returns null when no config exists', () => {
    expect(findConfig(tempDir)).toBeNull();
  });

  it('returns null when starting from root directory with no config', () => {
    const result = findConfig('/');
    // root directory may or may not have .slay.json, but should not crash
    expect(result === null || typeof result === 'string').toBe(true);
  });

  it('finds config in home directory as fallback', async () => {
    // Use a temp dir as fake home to avoid touching the real home directory
    const fakeHome = mkdtempSync(join(tmpdir(), 'slay-fakehome-'));
    writeFileSync(join(fakeHome, '.slay.json'), '{"profiles":{}}');
    const deepDir = mkdtempSync(join(tmpdir(), 'slay-deep-'));

    try {
      vi.resetModules();
      vi.doMock('node:os', async (importOriginal) => {
        const original = await importOriginal<typeof import('node:os')>();
        return { ...original, homedir: () => fakeHome };
      });

      const { findConfig: mockedFindConfig } = await import('../src/config.js');
      const result = mockedFindConfig(deepDir);
      expect(result).toBe(join(fakeHome, '.slay.json'));
    } finally {
      vi.resetModules();
      rmSync(fakeHome, { recursive: true, force: true });
      rmSync(deepDir, { recursive: true, force: true });
    }
  });

  it('skips home fallback when root equals home', async () => {
    vi.resetModules();
    vi.doMock('node:os', async (importOriginal) => {
      const original = await importOriginal<typeof import('node:os')>();
      return { ...original, homedir: () => '/' };
    });

    const { findConfig: mockedFindConfig } = await import('../src/config.js');
    const result = mockedFindConfig('/');
    expect(result).toBeNull();

    vi.resetModules();
  });

  it('returns null from root when no config anywhere', async () => {
    const fakeHome = mkdtempSync(join(tmpdir(), 'slay-fakehome-'));

    try {
      vi.resetModules();
      vi.doMock('node:os', async (importOriginal) => {
        const original = await importOriginal<typeof import('node:os')>();
        return { ...original, homedir: () => fakeHome };
      });

      const { findConfig: mockedFindConfig } = await import('../src/config.js');
      const result = mockedFindConfig('/');
      expect(result).toBeNull();
    } finally {
      vi.resetModules();
      rmSync(fakeHome, { recursive: true, force: true });
    }
  });
});

describe('loadConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-config-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('loads valid config', () => {
    const configPath = join(tempDir, '.slay.json');
    writeFileSync(configPath, JSON.stringify({ profiles: { dev: { ports: [3000] } } }));
    const config = loadConfig(configPath);
    expect(config.profiles.dev.ports).toEqual([3000]);
  });

  it('throws on missing profiles key', () => {
    const configPath = join(tempDir, '.slay.json');
    writeFileSync(configPath, '{}');
    expect(() => loadConfig(configPath)).toThrow('missing "profiles"');
  });

  it('throws on invalid JSON', () => {
    const configPath = join(tempDir, '.slay.json');
    writeFileSync(configPath, 'not json');
    expect(() => loadConfig(configPath)).toThrow();
  });
});

describe('saveConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-config-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('writes config to file', () => {
    const configPath = join(tempDir, '.slay.json');
    saveConfig(configPath, DEFAULT_CONFIG);
    expect(existsSync(configPath)).toBe(true);
    const loaded = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(loaded.profiles.dev.ports).toEqual([3000, 5173, 5432]);
  });
});

describe('resolveProfile', () => {
  it('returns existing profile', () => {
    const config = { profiles: { dev: { ports: [3000], soft: true } } };
    const profile = resolveProfile(config, 'dev');
    expect(profile.ports).toEqual([3000]);
    expect(profile.soft).toBe(true);
  });

  it('throws on unknown profile', () => {
    const config = { profiles: { dev: { ports: [3000] } } };
    expect(() => resolveProfile(config, 'staging')).toThrow('Profile "staging" not found');
  });

  it('lists available profiles in error', () => {
    const config = { profiles: { dev: {}, prod: {} } };
    expect(() => resolveProfile(config, 'test')).toThrow('Available: dev, prod');
  });

  it('shows (none) when no profiles exist', () => {
    const config = { profiles: {} };
    expect(() => resolveProfile(config, 'test')).toThrow('(none)');
  });
});

describe('mergeProfileOpts', () => {
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
  };

  it('applies profile ports when CLI has none', () => {
    const profile: ProfileOptions = { ports: [3000, 5432] };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.ports).toEqual([3000, 5432]);
  });

  it('CLI ports override profile ports', () => {
    const opts = { ...baseOpts, ports: [8080] };
    const profile: ProfileOptions = { ports: [3000, 5432] };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.ports).toEqual([8080]);
  });

  it('applies profile flags', () => {
    const profile: ProfileOptions = { soft: true, verbose: true, tree: true };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.soft).toBe(true);
    expect(merged.verbose).toBe(true);
    expect(merged.tree).toBe(true);
  });

  it('CLI flags override profile flags', () => {
    const opts = { ...baseOpts, force: true };
    const profile: ProfileOptions = { soft: true };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.force).toBe(true);
    expect(merged.soft).toBe(true);
  });

  it('applies profile protocol', () => {
    const profile: ProfileOptions = { protocol: 'udp' };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.protocol).toBe('udp');
  });

  it('does not mutate original opts', () => {
    const profile: ProfileOptions = { ports: [3000] };
    mergeProfileOpts(baseOpts, profile);
    expect(baseOpts.ports).toEqual([]);
  });

  it('applies all profile boolean flags', () => {
    const profile: ProfileOptions = {
      force: true,
      yes: true,
      soft: true,
      verbose: true,
      all: true,
      watch: true,
      dryRun: true,
      tree: true,
    };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.force).toBe(true);
    expect(merged.yes).toBe(true);
    expect(merged.soft).toBe(true);
    expect(merged.verbose).toBe(true);
    expect(merged.all).toBe(true);
    expect(merged.watch).toBe(true);
    expect(merged.dryRun).toBe(true);
    expect(merged.tree).toBe(true);
  });

  it('does not override CLI flags already set to true', () => {
    const opts = {
      ...baseOpts,
      force: true,
      yes: true,
      soft: true,
      verbose: true,
      all: true,
      watch: true,
      dryRun: true,
      tree: true,
      protocol: 'udp' as const,
    };
    const profile: ProfileOptions = {
      force: true,
      yes: true,
      soft: true,
      verbose: true,
      all: true,
      watch: true,
      dryRun: true,
      tree: true,
      protocol: 'tcp',
    };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.force).toBe(true);
    expect(merged.protocol).toBe('udp');
  });

  it('does not apply profile protocol when CLI protocol is non-tcp', () => {
    const opts = { ...baseOpts, protocol: 'udp' as const };
    const profile: ProfileOptions = { protocol: 'tcp' };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.protocol).toBe('udp');
  });

  it('applies profile name when CLI has none', () => {
    const profile: ProfileOptions = { name: 'node' };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.name).toBe('node');
  });

  it('CLI name overrides profile name', () => {
    const opts = { ...baseOpts, name: 'nginx' };
    const profile: ProfileOptions = { name: 'node' };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.name).toBe('nginx');
  });

  it('applies profile exclude when CLI has none', () => {
    const profile: ProfileOptions = { exclude: ['nginx'] };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.exclude).toEqual(['nginx']);
  });

  it('CLI exclude overrides profile exclude', () => {
    const opts = { ...baseOpts, exclude: ['node'] };
    const profile: ProfileOptions = { exclude: ['nginx'] };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.exclude).toEqual(['node']);
  });

  it('applies profile thenRun when CLI has none', () => {
    const profile: ProfileOptions = { thenRun: 'npm start' };
    const merged = mergeProfileOpts(baseOpts, profile);
    expect(merged.thenRun).toBe('npm start');
  });

  it('CLI thenRun overrides profile thenRun', () => {
    const opts = { ...baseOpts, thenRun: 'yarn dev' };
    const profile: ProfileOptions = { thenRun: 'npm start' };
    const merged = mergeProfileOpts(opts, profile);
    expect(merged.thenRun).toBe('yarn dev');
  });
});
