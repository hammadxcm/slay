import { createServer } from 'node:net';
import type { PlatformAdapter } from '../types.js';

export interface CheckResult {
  port: number;
  available: boolean;
  pid?: number;
  command?: string;
  label?: string;
}

export async function checkPort(adapter: PlatformAdapter, port: number): Promise<CheckResult> {
  const processes = await adapter.findByPort(port);
  if (processes.length === 0) return { port, available: true };
  const p = processes[0];
  return { port, available: false, pid: p.pid, command: p.command, label: p.label };
}

export async function checkPorts(
  adapter: PlatformAdapter,
  ports: number[],
): Promise<CheckResult[]> {
  return Promise.all(ports.map((port) => checkPort(adapter, port)));
}

export async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

export async function findNextAvailable(start: number, end: number): Promise<number | null> {
  for (let port = start; port <= end; port++) {
    if (await isPortFree(port)) return port;
  }
  return null;
}
