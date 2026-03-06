import { EventEmitter } from 'node:events';
import { vi } from 'vitest';
import type { PlatformAdapter, ProcessInfo } from '../src/types.js';

// --- Mock Adapter ---

export function mockAdapter(overrides: Partial<PlatformAdapter> = {}): PlatformAdapter {
  return {
    findByPort: vi.fn(async () => []),
    findAllListening: vi.fn(async () => []),
    kill: vi.fn(async () => true),
    isAlive: vi.fn(async () => true),
    ...overrides,
  };
}

export function mockAdapterWithProcesses(processes: ProcessInfo[]): PlatformAdapter {
  return {
    findByPort: vi.fn(async (port: number) => processes.filter((p) => p.port === port)),
    findAllListening: vi.fn(async () => processes),
    kill: vi.fn(async () => true),
    isAlive: vi.fn(async () => true),
  };
}

// --- Mock Stdin ---

export function createMockStdin(initialIsRaw?: boolean) {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    isRaw: initialIsRaw,
    setRawMode: vi.fn(function (this: { isRaw: boolean | undefined }, mode: boolean) {
      this.isRaw = mode;
      return this;
    }),
    resume: vi.fn(),
    pause: vi.fn(),
    setEncoding: vi.fn(),
  });
}

// --- Mock Platform ---

export function withMockPlatform(platform: string, fn: () => void): void {
  const originalPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
  try {
    fn();
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  }
}

export async function withMockPlatformAsync(
  platform: string,
  fn: () => Promise<void>,
): Promise<void> {
  const originalPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
  try {
    await fn();
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  }
}

// --- Test Fixtures ---

export const PROC_NODE: ProcessInfo = { pid: 100, port: 3000, state: 'LISTEN', command: 'node' };
export const PROC_NGINX: ProcessInfo = { pid: 200, port: 8080, state: 'LISTEN', command: 'nginx' };
export const PROC_POSTGRES: ProcessInfo = { pid: 300, port: 5432, state: 'LISTEN' };
