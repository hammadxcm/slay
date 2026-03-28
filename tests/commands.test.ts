import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../src/config.js';

vi.mock('../src/ui/prompt.js', () => ({
  textInput: vi.fn(),
  confirm: vi.fn(),
}));

import { confirm, textInput } from '../src/ui/prompt.js';

const mockedTextInput = vi.mocked(textInput);
const mockedConfirm = vi.mocked(confirm);

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

  it('lists profiles with all flags', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({
        profiles: {
          full: {
            ports: [3000],
            all: true,
            force: true,
            soft: true,
            yes: true,
            verbose: true,
            watch: true,
            dryRun: true,
            tree: true,
            protocol: 'udp',
          },
        },
      }),
    );
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('full');
    expect(output).toContain('--all');
    expect(output).toContain('--force');
    expect(output).toContain('--soft');
    expect(output).toContain('--yes');
    expect(output).toContain('--verbose');
    expect(output).toContain('--watch');
    expect(output).toContain('--dry-run');
    expect(output).toContain('--tree');
    expect(output).toContain('--udp');
    spy.mockRestore();
  });

  it('lists profiles with name, exclude, and then options', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({
        profiles: {
          hook: {
            ports: [3000],
            name: 'node',
            exclude: ['nginx', 'redis'],
            thenRun: 'npm start',
          },
        },
      }),
    );
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('hook');
    expect(output).toContain('--name "node"');
    expect(output).toContain('--exclude "nginx"');
    expect(output).toContain('--exclude "redis"');
    expect(output).toContain('--then "npm start"');
    spy.mockRestore();
  });

  it('lists profile with no ports and only some flags', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({
        profiles: {
          minimal: { all: true },
          noportsnoflags: {},
        },
      }),
    );
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('minimal');
    expect(output).toContain('noportsnoflags');
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

  it('shows message when config has no profiles', async () => {
    writeFileSync(join(tempDir, '.slay.json'), JSON.stringify({ profiles: {} }));
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['list']);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No profiles defined');
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

describe('profile add', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'slay-profile-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    mockedTextInput.mockReset();
    mockedConfirm.mockReset();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('adds a new profile via buildProfile', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({ profiles: { existing: { ports: [9999] } } }),
    );
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // buildProfile sequence: name, ports, strategy, protocol
    mockedTextInput
      .mockResolvedValueOnce('myprofile') // name
      .mockResolvedValueOnce('3000, 4000') // ports
      .mockResolvedValueOnce('soft') // strategy
      .mockResolvedValueOnce('tcp'); // protocol

    // confirm sequence: tree, verbose, watch, yes, save
    mockedConfirm
      .mockResolvedValueOnce(true) // tree
      .mockResolvedValueOnce(false) // verbose
      .mockResolvedValueOnce(false) // watch
      .mockResolvedValueOnce(false) // yes
      .mockResolvedValueOnce(true); // save

    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['add']);

    const config = JSON.parse(readFileSync(join(tempDir, '.slay.json'), 'utf-8'));
    expect(config.profiles.myprofile).toBeDefined();
    expect(config.profiles.myprofile.ports).toEqual([3000, 4000]);
    expect(config.profiles.myprofile.soft).toBe(true);
    expect(config.profiles.myprofile.tree).toBe(true);
    logSpy.mockRestore();
  });

  it('exits when no config found for add', async () => {
    // No .slay.json in tempDir
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    const { runProfile } = await import('../src/commands/profile.js');
    await expect(runProfile(['add'])).rejects.toThrow('process.exit');

    expect(exitSpy).toHaveBeenCalledWith(1);
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('overwrites existing profile with warning', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({ profiles: { dev: { ports: [3000] } } }),
    );
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockedTextInput
      .mockResolvedValueOnce('dev') // name (existing)
      .mockResolvedValueOnce('8080') // ports
      .mockResolvedValueOnce('force') // strategy
      .mockResolvedValueOnce('udp'); // protocol

    mockedConfirm
      .mockResolvedValueOnce(false) // tree
      .mockResolvedValueOnce(true) // verbose
      .mockResolvedValueOnce(true) // watch
      .mockResolvedValueOnce(true) // yes
      .mockResolvedValueOnce(true); // save

    const { runProfile } = await import('../src/commands/profile.js');
    await runProfile(['add']);

    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Overwriting');

    const config = JSON.parse(readFileSync(join(tempDir, '.slay.json'), 'utf-8'));
    expect(config.profiles.dev.ports).toEqual([8080]);
    expect(config.profiles.dev.force).toBe(true);
    expect(config.profiles.dev.protocol).toBe('udp');
    expect(config.profiles.dev.verbose).toBe(true);
    expect(config.profiles.dev.watch).toBe(true);
    expect(config.profiles.dev.yes).toBe(true);
    logSpy.mockRestore();
  });
});

describe('profile rm edge cases', () => {
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

  it('exits when no config found for rm', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    const { runProfile } = await import('../src/commands/profile.js');
    await expect(runProfile(['rm', 'dev'])).rejects.toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('exits when profile not found for rm', async () => {
    writeFileSync(
      join(tempDir, '.slay.json'),
      JSON.stringify({ profiles: { dev: { ports: [3000] } } }),
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    const { runProfile } = await import('../src/commands/profile.js');
    await expect(runProfile(['rm', 'nonexistent'])).rejects.toThrow('process.exit');

    expect(errorSpy.mock.calls[0][0]).toContain('not found');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('exits when rm subcommand has no name', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    const { runProfile } = await import('../src/commands/profile.js');
    await expect(runProfile(['rm'])).rejects.toThrow('process.exit');

    expect(errorSpy.mock.calls[0][0]).toContain('Usage');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('profile unknown subcommand', () => {
  it('exits on unknown subcommand', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    const { runProfile } = await import('../src/commands/profile.js');
    await expect(runProfile(['banana'])).rejects.toThrow('process.exit');

    expect(errorSpy.mock.calls[0][0]).toContain('Unknown profile subcommand');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('buildProfile', () => {
  beforeEach(() => {
    mockedTextInput.mockReset();
    mockedConfirm.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exits when profile name is empty', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    mockedTextInput.mockResolvedValueOnce('   '); // empty name

    const { buildProfile } = await import('../src/commands/profile-builder.js');
    await expect(buildProfile()).rejects.toThrow('process.exit');

    expect(errorSpy.mock.calls[0][0]).toContain('cannot be empty');
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('aborts when user declines save', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    mockedTextInput
      .mockResolvedValueOnce('testprofile') // name
      .mockResolvedValueOnce('') // ports (empty)
      .mockResolvedValueOnce('') // strategy (default)
      .mockResolvedValueOnce(''); // protocol

    mockedConfirm
      .mockResolvedValueOnce(true) // all (since ports empty)
      .mockResolvedValueOnce(false) // tree
      .mockResolvedValueOnce(false) // verbose
      .mockResolvedValueOnce(false) // watch
      .mockResolvedValueOnce(false) // yes
      .mockResolvedValueOnce(false); // save - decline

    const { buildProfile } = await import('../src/commands/profile-builder.js');
    await expect(buildProfile()).rejects.toThrow('process.exit');

    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Aborted');
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('builds profile with all=false when user declines all', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockedTextInput
      .mockResolvedValueOnce('minimal') // name
      .mockResolvedValueOnce('') // ports (empty)
      .mockResolvedValueOnce('') // strategy
      .mockResolvedValueOnce(''); // protocol

    mockedConfirm
      .mockResolvedValueOnce(false) // all - decline
      .mockResolvedValueOnce(false) // tree
      .mockResolvedValueOnce(false) // verbose
      .mockResolvedValueOnce(false) // watch
      .mockResolvedValueOnce(false) // yes
      .mockResolvedValueOnce(true); // save

    const { buildProfile } = await import('../src/commands/profile-builder.js');
    const result = await buildProfile();

    expect(result.name).toBe('minimal');
    expect(result.profile.all).toBeUndefined();
    logSpy.mockRestore();
  });

  it('builds profile with invalid port numbers filtered', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockedTextInput
      .mockResolvedValueOnce('testports') // name
      .mockResolvedValueOnce('abc, 99999, 3000') // ports with invalid ones
      .mockResolvedValueOnce('') // strategy
      .mockResolvedValueOnce(''); // protocol

    mockedConfirm
      .mockResolvedValueOnce(false) // tree
      .mockResolvedValueOnce(false) // verbose
      .mockResolvedValueOnce(false) // watch
      .mockResolvedValueOnce(false) // yes
      .mockResolvedValueOnce(true); // save

    const { buildProfile } = await import('../src/commands/profile-builder.js');
    const result = await buildProfile();

    expect(result.profile.ports).toEqual([3000]);
    logSpy.mockRestore();
  });

  it('does not set ports when all port numbers are invalid', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockedTextInput
      .mockResolvedValueOnce('noports') // name
      .mockResolvedValueOnce('abc, zzz') // all invalid port values
      .mockResolvedValueOnce('') // strategy
      .mockResolvedValueOnce(''); // protocol

    mockedConfirm
      .mockResolvedValueOnce(false) // tree
      .mockResolvedValueOnce(false) // verbose
      .mockResolvedValueOnce(false) // watch
      .mockResolvedValueOnce(false) // yes
      .mockResolvedValueOnce(true); // save

    const { buildProfile } = await import('../src/commands/profile-builder.js');
    const result = await buildProfile();

    expect(result.profile.ports).toBeUndefined();
    logSpy.mockRestore();
  });
});
