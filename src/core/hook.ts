import { spawn } from 'node:child_process';

export async function runHook(
  command: string,
  json = false,
): Promise<{ command: string; exitCode: number; success: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: json ? 'pipe' : 'inherit' });
    child.on('error', () => resolve({ command, exitCode: 1, success: false }));
    child.on('close', (code) =>
      resolve({ command, exitCode: code ?? 0, success: (code ?? 0) === 0 }),
    );
  });
}
