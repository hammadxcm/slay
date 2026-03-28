import type { ProcessInfo } from '../types.js';

export function matchesPattern(command: string | undefined, pattern: string): boolean {
  if (!command) return false;
  try {
    return new RegExp(pattern, 'i').test(command);
  } catch {
    return command.toLowerCase().includes(pattern.toLowerCase());
  }
}

export function excludeProcesses(processes: ProcessInfo[], patterns: string[]): ProcessInfo[] {
  return processes.filter((p) => !patterns.some((pat) => matchesPattern(p.command, pat)));
}
