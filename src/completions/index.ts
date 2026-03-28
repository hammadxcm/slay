import { generateBash } from './bash.js';
import { generateFish } from './fish.js';
import { generateZsh } from './zsh.js';

export const SUBCOMMANDS = ['init', 'profile', 'info', 'check', 'completions'];

export const FLAGS = [
  '--force',
  '--soft',
  '--yes',
  '--verbose',
  '--dry-run',
  '--json',
  '--watch',
  '--interactive',
  '--all',
  '--tree',
  '--udp',
  '--profile',
  '--name',
  '--exclude',
  '--then',
  '--help',
  '--next',
  '--list-profile-names',
];

export const PROFILE_SUBCOMMANDS = ['list', 'add', 'rm'];

export function generateCompletion(shell: string): string {
  switch (shell) {
    case 'bash':
      return generateBash();
    case 'zsh':
      return generateZsh();
    case 'fish':
      return generateFish();
    default:
      throw new Error(`Unsupported shell: ${shell}. Supported: bash, zsh, fish`);
  }
}
