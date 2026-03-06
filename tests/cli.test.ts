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
