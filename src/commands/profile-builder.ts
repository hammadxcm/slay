import type { ProfileOptions, Protocol } from '../types.js';
import { c } from '../ui/colors.js';
import { textInput } from '../ui/prompt.js';
import { confirm } from '../ui/prompt.js';

export async function buildProfile(): Promise<{ name: string; profile: ProfileOptions }> {
  console.log(`\n  ${c.bold('Create a new profile')}\n`);

  const name = await textInput('  Profile name: ');
  if (!name.trim()) {
    console.error(`\n  ${c.red('Profile name cannot be empty.')}\n`);
    process.exit(1);
  }

  const profile: ProfileOptions = {};

  const portsInput = await textInput('  Ports (comma-separated, or empty for --all): ');
  if (portsInput.trim()) {
    const ports = portsInput
      .split(/[,\s]+/)
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 65535);
    if (ports.length > 0) profile.ports = ports;
  } else {
    const useAll = await confirm('  Kill all listening processes?');
    if (useAll) profile.all = true;
  }

  const strategy = await textInput('  Strategy (default/soft/force): ');
  if (strategy.trim() === 'soft') profile.soft = true;
  else if (strategy.trim() === 'force') profile.force = true;

  const useTree = await confirm('  Kill process tree?');
  if (useTree) profile.tree = true;

  const useVerbose = await confirm('  Verbose output?');
  if (useVerbose) profile.verbose = true;

  const useWatch = await confirm('  Watch mode?');
  if (useWatch) profile.watch = true;

  const useYes = await confirm('  Skip confirmation?');
  if (useYes) profile.yes = true;

  const protocolInput = await textInput('  Protocol (tcp/udp, default tcp): ');
  if (protocolInput.trim() === 'udp') profile.protocol = 'udp' as Protocol;

  console.log(`\n  ${c.bold('Preview:')}`);
  console.log(`  ${c.green(name)}: ${JSON.stringify(profile)}`);

  const ok = await confirm('\n  Save this profile?');
  if (!ok) {
    console.log(`  ${c.dim('Aborted.')}\n`);
    process.exit(0);
  }

  return { name: name.trim(), profile };
}
