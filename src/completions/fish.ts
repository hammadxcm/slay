import { FLAGS, PROFILE_SUBCOMMANDS, SUBCOMMANDS } from './index.js';

export function generateFish(): string {
  const lines: string[] = ['# slay fish completion'];

  // Subcommands
  for (const sub of SUBCOMMANDS) {
    lines.push(`complete -c slay -n '__fish_use_subcommand' -a '${sub}' -d '${sub} command'`);
  }

  // Flags
  for (const flag of FLAGS) {
    const name = flag.replace(/^--/, '');
    lines.push(`complete -c slay -l '${name}'`);
  }

  // Profile subcommands
  for (const sub of PROFILE_SUBCOMMANDS) {
    lines.push(`complete -c slay -n '__fish_seen_subcommand_from profile' -a '${sub}' -d '${sub}'`);
  }

  // Completions shells
  for (const shell of ['bash', 'zsh', 'fish']) {
    lines.push(
      `complete -c slay -n '__fish_seen_subcommand_from completions' -a '${shell}' -d '${shell}'`,
    );
  }

  // Dynamic profile names
  lines.push(
    "complete -c slay -n '__fish_seen_subcommand_from --profile' -a '(slay --list-profile-names 2>/dev/null)' -d 'profile'",
  );

  lines.push('');
  return lines.join('\n');
}
