import type { PlatformAdapter, ProcessInfo } from '../types.js';
import { enrichLabel } from './labels.js';

export async function findByPort(adapter: PlatformAdapter, port: number): Promise<ProcessInfo[]> {
  const processes = await adapter.findByPort(port);
  return processes.map(enrichLabel);
}

export async function findAllListening(adapter: PlatformAdapter): Promise<ProcessInfo[]> {
  const processes = await adapter.findAllListening();
  return processes.map(enrichLabel);
}

export async function findByPorts(
  adapter: PlatformAdapter,
  ports: number[],
): Promise<ProcessInfo[]> {
  const results = await Promise.all(ports.map((port) => findByPort(adapter, port)));
  return results.flat();
}
