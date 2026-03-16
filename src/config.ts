import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import type { CliOptions, ProfileOptions, SlayConfig } from './types.js';

const CONFIG_NAME = '.slay.json';

export function findConfig(startDir?: string): string | null {
  let dir = resolve(startDir || process.cwd());
  const root = dirname(dir) === dir ? dir : undefined;
  const home = homedir();

  while (true) {
    const candidate = join(dir, CONFIG_NAME);
    if (existsSync(candidate)) return candidate;

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Check $HOME as final fallback
  if (root !== home) {
    const homeCandidate = join(home, CONFIG_NAME);
    if (existsSync(homeCandidate)) return homeCandidate;
  }

  return null;
}

export function loadConfig(configPath: string): SlayConfig {
  const raw = readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.profiles || typeof parsed.profiles !== 'object') {
    throw new Error(`Invalid config: missing "profiles" object in ${configPath}`);
  }
  return parsed as SlayConfig;
}

export function saveConfig(configPath: string, config: SlayConfig): void {
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
}

export function resolveProfile(config: SlayConfig, name: string): ProfileOptions {
  const profile = config.profiles[name];
  if (!profile) {
    const available = Object.keys(config.profiles);
    throw new Error(
      `Profile "${name}" not found. Available: ${available.length > 0 ? available.join(', ') : '(none)'}`,
    );
  }
  return profile;
}

export function mergeProfileOpts(base: CliOptions, profile: ProfileOptions): CliOptions {
  const merged = { ...base };

  // Profile provides defaults — CLI flags override
  if (profile.ports && merged.ports.length === 0) {
    merged.ports = [...profile.ports];
  }
  if (profile.force && !merged.force) merged.force = true;
  if (profile.yes && !merged.yes) merged.yes = true;
  if (profile.soft && !merged.soft) merged.soft = true;
  if (profile.verbose && !merged.verbose) merged.verbose = true;
  if (profile.all && !merged.all) merged.all = true;
  if (profile.watch && !merged.watch) merged.watch = true;
  if (profile.dryRun && !merged.dryRun) merged.dryRun = true;
  if (profile.tree && !merged.tree) merged.tree = true;
  if (profile.protocol && merged.protocol === 'tcp') merged.protocol = profile.protocol;

  return merged;
}

export const DEFAULT_CONFIG: SlayConfig = {
  profiles: {
    dev: { ports: [3000, 5173, 5432], soft: true },
    clean: { all: true, force: true },
    api: { ports: [8080, 8443], tree: true, verbose: true },
  },
};
