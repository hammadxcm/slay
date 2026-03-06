import { exec } from '../utils/exec.js';

export async function findChildren(pid: number): Promise<number[]> {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await exec(
        `wmic process where (ParentProcessId=${pid}) get ProcessId /format:csv 2>nul`,
      );
      return stdout
        .trim()
        .split('\n')
        .map((line) => line.trim().split(',').pop() || '')
        .map((s) => Number.parseInt(s, 10))
        .filter((n) => !Number.isNaN(n) && n !== pid);
    }
    const { stdout } = await exec(`pgrep -P ${pid} 2>/dev/null`);
    return stdout
      .trim()
      .split('\n')
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => !Number.isNaN(n));
  } catch {
    return [];
  }
}

export async function findDescendants(pid: number): Promise<number[]> {
  const children = await findChildren(pid);
  const descendants: number[] = [];
  for (const child of children) {
    const grandchildren = await findDescendants(child);
    descendants.push(...grandchildren, child);
  }
  return descendants;
}
