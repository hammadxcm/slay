import { exec as nodeExec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(nodeExec);

export async function exec(
  command: string,
  timeout = 10_000,
): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout });
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; killed?: boolean };
    if (err.killed) {
      throw new Error(`Command timed out after ${timeout}ms: ${command}`);
    }
    // Some commands (like lsof) return non-zero when no results found
    if (err.stdout !== undefined) {
      return { stdout: err.stdout || '', stderr: err.stderr || '' };
    }
    throw error;
  }
}
