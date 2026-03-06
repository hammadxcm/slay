import { afterEach, describe, expect, it, vi } from 'vitest';
import { platform, setPlatform } from '../src/platform/index.js';
import type { PlatformAdapter } from '../src/types.js';
import { withMockPlatform } from './helpers.js';

describe('platform', () => {
  afterEach(() => {
    setPlatform(null as unknown as PlatformAdapter);
  });

  it('returns a PlatformAdapter', () => {
    const adapter = platform();
    expect(typeof adapter.findByPort).toBe('function');
    expect(typeof adapter.findAllListening).toBe('function');
    expect(typeof adapter.kill).toBe('function');
    expect(typeof adapter.isAlive).toBe('function');
  });

  it('caches the platform adapter', () => {
    const a = platform();
    const b = platform();
    expect(a).toBe(b);
  });

  it('allows overriding via setPlatform', () => {
    const mock: PlatformAdapter = {
      findByPort: vi.fn(async () => []),
      findAllListening: vi.fn(async () => []),
      kill: vi.fn(async () => true),
      isAlive: vi.fn(async () => true),
    };
    setPlatform(mock);
    expect(platform()).toBe(mock);
  });

  it('returns windows adapter on win32', () => {
    withMockPlatform('win32', () => {
      setPlatform(null as unknown as PlatformAdapter);
      const adapter = platform();
      expect(typeof adapter.findByPort).toBe('function');
    });
  });

  it('returns unix adapter on darwin', () => {
    withMockPlatform('darwin', () => {
      setPlatform(null as unknown as PlatformAdapter);
      const adapter = platform();
      expect(typeof adapter.findByPort).toBe('function');
    });
  });

  it('returns UDP adapter (unix)', () => {
    withMockPlatform('darwin', () => {
      const adapter = platform('udp');
      expect(typeof adapter.findByPort).toBe('function');
    });
  });

  it('returns UDP adapter (win32)', () => {
    withMockPlatform('win32', () => {
      const adapter = platform('udp');
      expect(typeof adapter.findByPort).toBe('function');
    });
  });
});
