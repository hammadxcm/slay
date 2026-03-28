import { describe, expect, it, vi } from 'vitest';
import { parseArgs, showHelp, validateOptions } from '../src/cli.js';

describe('parseArgs', () => {
  it('parses a single port', () => {
    const opts = parseArgs(['node', 'slay', '3000']);
    expect(opts.ports).toEqual([3000]);
  });

  it('parses multiple ports', () => {
    const opts = parseArgs(['node', 'slay', '3000', '8080']);
    expect(opts.ports).toEqual([3000, 8080]);
  });

  it('parses --force / -f', () => {
    expect(parseArgs(['node', 'slay', '3000', '--force']).force).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '-f']).force).toBe(true);
  });

  it('parses --yes / -y', () => {
    expect(parseArgs(['node', 'slay', '3000', '-y']).yes).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '--yes']).yes).toBe(true);
  });

  it('parses --soft', () => {
    expect(parseArgs(['node', 'slay', '3000', '--soft']).soft).toBe(true);
  });

  it('parses --verbose / -v', () => {
    expect(parseArgs(['node', 'slay', '3000', '-v']).verbose).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '--verbose']).verbose).toBe(true);
  });

  it('parses --all', () => {
    expect(parseArgs(['node', 'slay', '--all']).all).toBe(true);
  });

  it('parses --json', () => {
    expect(parseArgs(['node', 'slay', '3000', '--json']).json).toBe(true);
  });

  it('parses --watch / -w', () => {
    expect(parseArgs(['node', 'slay', '3000', '-w']).watch).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '--watch']).watch).toBe(true);
  });

  it('parses --interactive / -i', () => {
    expect(parseArgs(['node', 'slay', '-i']).interactive).toBe(true);
    expect(parseArgs(['node', 'slay', '--interactive']).interactive).toBe(true);
  });

  it('parses --help / -h', () => {
    expect(parseArgs(['node', 'slay', '-h']).help).toBe(true);
    expect(parseArgs(['node', 'slay', '--help']).help).toBe(true);
  });

  it('returns defaults for empty args', () => {
    const opts = parseArgs(['node', 'slay']);
    expect(opts).toEqual({
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
    });
  });

  it('parses combined flags', () => {
    const opts = parseArgs(['node', 'slay', '3000', '-f', '-y', '-v', '--json']);
    expect(opts.force).toBe(true);
    expect(opts.yes).toBe(true);
    expect(opts.verbose).toBe(true);
    expect(opts.json).toBe(true);
  });

  it('throws on invalid port (too high)', () => {
    expect(() => parseArgs(['node', 'slay', '99999'])).toThrow('Invalid port');
  });

  it('throws on invalid port (zero)', () => {
    expect(() => parseArgs(['node', 'slay', '0'])).toThrow('Invalid port');
  });

  it('throws on unknown option', () => {
    expect(() => parseArgs(['node', 'slay', '--unknown'])).toThrow('Unknown option: --unknown');
  });

  it('accepts edge port values', () => {
    expect(parseArgs(['node', 'slay', '1']).ports).toEqual([1]);
    expect(parseArgs(['node', 'slay', '65535']).ports).toEqual([65535]);
  });

  it('parses --dry-run / -n', () => {
    expect(parseArgs(['node', 'slay', '3000', '--dry-run']).dryRun).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '-n']).dryRun).toBe(true);
  });

  it('parses --tree / -t', () => {
    expect(parseArgs(['node', 'slay', '3000', '--tree']).tree).toBe(true);
    expect(parseArgs(['node', 'slay', '3000', '-t']).tree).toBe(true);
  });

  it('parses --udp', () => {
    expect(parseArgs(['node', 'slay', '3000', '--udp']).protocol).toBe('udp');
  });

  it('parses port range 8000-8010', () => {
    const opts = parseArgs(['node', 'slay', '8000-8010']);
    expect(opts.ports).toHaveLength(11);
    expect(opts.ports[0]).toBe(8000);
    expect(opts.ports[10]).toBe(8010);
  });

  it('parses single-port range 3000-3000', () => {
    const opts = parseArgs(['node', 'slay', '3000-3000']);
    expect(opts.ports).toEqual([3000]);
  });

  it('throws on invalid range (start > end)', () => {
    expect(() => parseArgs(['node', 'slay', '8010-8000'])).toThrow('start must be');
  });

  it('throws on range too large', () => {
    expect(() => parseArgs(['node', 'slay', '1-65535'])).toThrow('Range too large');
  });

  it('throws on invalid port in range (start)', () => {
    expect(() => parseArgs(['node', 'slay', '0-100'])).toThrow('Invalid port');
  });

  it('throws on invalid port in range (end too high)', () => {
    expect(() => parseArgs(['node', 'slay', '100-99999'])).toThrow('Invalid port');
  });

  it('parses port range mixed with single ports', () => {
    const opts = parseArgs(['node', 'slay', '3000', '8000-8002']);
    expect(opts.ports).toEqual([3000, 8000, 8001, 8002]);
  });

  it('parses --profile flag', () => {
    const opts = parseArgs(['node', 'slay', '--profile', 'dev']);
    expect(opts.profile).toBe('dev');
  });

  it('throws when --profile has no name', () => {
    expect(() => parseArgs(['node', 'slay', '--profile'])).toThrow('--profile requires a name');
  });

  it('parses --profile with additional flags', () => {
    const opts = parseArgs(['node', 'slay', '--profile', 'dev', '--force']);
    expect(opts.profile).toBe('dev');
    expect(opts.force).toBe(true);
  });

  it('detects init subcommand', () => {
    const opts = parseArgs(['node', 'slay', 'init']);
    expect(opts.command).toBe('init');
  });

  it('detects profile subcommand', () => {
    const opts = parseArgs(['node', 'slay', 'profile', 'list']);
    expect(opts.command).toBe('profile');
    expect(opts.subArgs).toEqual(['list']);
  });

  it('detects info subcommand with ports', () => {
    const opts = parseArgs(['node', 'slay', 'info', '3000', '8080']);
    expect(opts.command).toBe('info');
    expect(opts.ports).toEqual([3000, 8080]);
  });

  it('detects info subcommand with port range', () => {
    const opts = parseArgs(['node', 'slay', 'info', '8000-8005']);
    expect(opts.command).toBe('info');
    expect(opts.ports).toHaveLength(6);
  });

  it('throws on invalid port in info subcommand', () => {
    expect(() => parseArgs(['node', 'slay', 'info', '99999'])).toThrow('Invalid port');
  });

  it('throws on invalid end port in range within info subcommand', () => {
    expect(() => parseArgs(['node', 'slay', 'info', '100-99999'])).toThrow('Invalid port');
  });

  it('ignores non-numeric non-range args in info subcommand', () => {
    const opts = parseArgs(['node', 'slay', 'info', '3000', 'abc']);
    expect(opts.command).toBe('info');
    expect(opts.ports).toEqual([3000]);
  });
});

describe('validateOptions', () => {
  it('throws when no ports and no --all/--interactive/--help', () => {
    const opts = parseArgs(['node', 'slay']);
    expect(() => validateOptions(opts)).toThrow('No ports specified');
  });

  it('passes with ports', () => {
    const opts = parseArgs(['node', 'slay', '3000']);
    expect(() => validateOptions(opts)).not.toThrow();
  });

  it('passes with --all', () => {
    const opts = parseArgs(['node', 'slay', '--all']);
    expect(() => validateOptions(opts)).not.toThrow();
  });

  it('passes with -i', () => {
    const opts = parseArgs(['node', 'slay', '-i']);
    expect(() => validateOptions(opts)).not.toThrow();
  });

  it('passes with --help (no ports needed)', () => {
    const opts = parseArgs(['node', 'slay', '--help']);
    expect(() => validateOptions(opts)).not.toThrow();
  });

  it('passes with --profile (no ports needed)', () => {
    const opts = parseArgs(['node', 'slay', '--profile', 'dev']);
    expect(() => validateOptions(opts)).not.toThrow();
  });

  it('passes with subcommand', () => {
    const opts = parseArgs(['node', 'slay', 'init']);
    expect(() => validateOptions(opts)).not.toThrow();
  });
});

describe('showHelp', () => {
  it('prints help text to stdout', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    showHelp();
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('slay');
    expect(spy.mock.calls[0][0]).toContain('--force');
    spy.mockRestore();
  });
});
