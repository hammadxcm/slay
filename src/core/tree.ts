import { exec, isWmicAvailable } from '../utils/exec.js';

export async function findChildren(pid: number): Promise<number[]> {
  try {
    if (process.platform === 'win32') {
      return await findChildrenWindows(pid);
    }
    const { stdout } = await exec(`pgrep -P ${pid} 2>/dev/null`);
    return stdout
      .trim()
      .split(/\r?\n/)
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
  } catch {
    return [];
  }
}

async function findChildrenWindows(pid: number): Promise<number[]> {
  const useWmic = await isWmicAvailable();
  if (useWmic) {
    const { stdout } = await exec(
      `wmic process where (ParentProcessId=${pid}) get ProcessId /format:csv 2>nul`,
    );
    return stdout
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim().split(',').pop() || '')
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => !Number.isNaN(n) && n !== pid);
  }
  const { stdout } = await exec(
    `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter 'ParentProcessId=${pid}' | Select-Object -ExpandProperty ProcessId"`,
  );
  return stdout
    .trim()
    .split(/\r?\n/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n !== pid);
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
