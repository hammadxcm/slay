import { describe, expect, it } from 'vitest';
import { generateCompletion } from '../src/completions/index.js';

describe('generateCompletion', () => {
  it('generates bash script with expected keywords', () => {
    const script = generateCompletion('bash');
    expect(script).toContain('_slay_completions');
    expect(script).toContain('complete -F');
    expect(script).toContain('--force');
    expect(script).toContain('--list-profile-names');
    expect(script).toContain('completions');
    expect(script).toContain('profile');
    expect(script).toContain('bash zsh fish');
  });

  it('generates zsh script with expected keywords', () => {
    const script = generateCompletion('zsh');
    expect(script).toContain('compdef _slay slay');
    expect(script).toContain('_slay');
    expect(script).toContain('--force');
    expect(script).toContain('--list-profile-names');
    expect(script).toContain('completions');
  });

  it('generates fish script with expected keywords', () => {
    const script = generateCompletion('fish');
    expect(script).toContain('complete -c slay');
    expect(script).toContain("'force'");
    expect(script).toContain("'list-profile-names'");
    expect(script).toContain('completions');
    expect(script).toContain('__fish_use_subcommand');
  });

  it('throws for unknown shell', () => {
    expect(() => generateCompletion('powershell')).toThrow('Unsupported shell');
  });
});
