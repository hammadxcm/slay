import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_CONFIG, saveConfig } from '../config.js';
import { c } from '../ui/colors.js';

export async function runInit(): Promise<void> {
  const configPath = join(process.cwd(), '.slay.json');

  if (existsSync(configPath)) {
    console.log(`\n  ${c.yellow('warning')} .slay.json already exists in ${process.cwd()}`);
    console.log(`  ${c.dim('Delete it first if you want to regenerate.')}\n`);
    return;
  }

  saveConfig(configPath, DEFAULT_CONFIG);
  console.log(`\n  ${c.green('✓')} Created .slay.json with example profiles`);
  console.log(
    `  ${c.dim('Edit profiles or run')} slay profile add ${c.dim('to create new ones.')}\n`,
  );
}
