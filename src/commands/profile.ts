import { findConfig, loadConfig, saveConfig } from '../config.js';
import { c } from '../ui/colors.js';

export async function runProfile(subArgs: string[]): Promise<void> {
  const sub = subArgs[0];

  if (!sub || sub === 'list') {
    await profileList();
  } else if (sub === 'add') {
    await profileAdd();
  } else if (sub === 'rm') {
    const name = subArgs[1];
    if (!name) {
      console.error(`\n  ${c.red('Usage: slay profile rm <name>')}\n`);
      process.exit(1);
    }
    await profileRm(name);
  } else {
    console.error(`\n  ${c.red(`Unknown profile subcommand: ${sub}`)}`);
    console.log(`  ${c.dim('Usage: slay profile [list|add|rm <name>]')}\n`);
    process.exit(1);
  }
}

async function profileList(): Promise<void> {
  const configPath = findConfig();
  if (!configPath) {
    console.log(`\n  ${c.dim('No .slay.json found. Run')} slay init ${c.dim('to create one.')}\n`);
    return;
  }

  const config = loadConfig(configPath);
  const names = Object.keys(config.profiles);

  if (names.length === 0) {
    console.log(`\n  ${c.dim('No profiles defined in')} ${configPath}\n`);
    return;
  }

  console.log(`\n  ${c.bold('Profiles')} ${c.dim(`(${configPath})`)}\n`);

  for (const name of names) {
    const profile = config.profiles[name];
    const parts: string[] = [];

    if (profile.ports && profile.ports.length > 0) {
      parts.push(`ports: ${profile.ports.join(', ')}`);
    }
    if (profile.all) parts.push('--all');
    if (profile.force) parts.push('--force');
    if (profile.soft) parts.push('--soft');
    if (profile.yes) parts.push('--yes');
    if (profile.verbose) parts.push('--verbose');
    if (profile.watch) parts.push('--watch');
    if (profile.dryRun) parts.push('--dry-run');
    if (profile.tree) parts.push('--tree');
    if (profile.protocol && profile.protocol !== 'tcp') parts.push(`--${profile.protocol}`);

    console.log(`  ${c.green(name.padEnd(12))} ${c.dim(parts.join('  '))}`);
  }
  console.log();
}

async function profileAdd(): Promise<void> {
  const { buildProfile } = await import('./profile-builder.js');
  const configPath = findConfig();

  if (!configPath) {
    console.log(`\n  ${c.dim('No .slay.json found. Run')} slay init ${c.dim('first.')}\n`);
    process.exit(1);
  }

  const config = loadConfig(configPath);
  const { name, profile } = await buildProfile();

  if (config.profiles[name]) {
    console.log(`\n  ${c.yellow('warning')} Overwriting existing profile "${name}"`);
  }

  config.profiles[name] = profile;
  saveConfig(configPath, config);
  console.log(`\n  ${c.green('✓')} Profile "${name}" saved to ${configPath}\n`);
}

async function profileRm(name: string): Promise<void> {
  const configPath = findConfig();
  if (!configPath) {
    console.log(`\n  ${c.dim('No .slay.json found.')}\n`);
    process.exit(1);
  }

  const config = loadConfig(configPath);
  if (!config.profiles[name]) {
    console.error(`\n  ${c.red(`Profile "${name}" not found.`)}\n`);
    process.exit(1);
  }

  delete config.profiles[name];
  saveConfig(configPath, config);
  console.log(`\n  ${c.green('✓')} Removed profile "${name}"\n`);
}
