import type { ProcessInfo, Protocol } from '../types.js';

export function deduplicateByPid(
  lines: string[],
  parseLine: (line: string) => ProcessInfo | null,
  protocol: Protocol,
): ProcessInfo[] {
  const results: ProcessInfo[] = [];
  const seen = new Set<number>();
  for (const line of lines) {
    const info = parseLine(line);
    if (info && !seen.has(info.pid)) {
      seen.add(info.pid);
      info.protocol = protocol;
      results.push(info);
    }
  }
  return results;
}
