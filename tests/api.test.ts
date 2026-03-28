import { describe, expect, it } from 'vitest';
import {
  SlayError,
  enrichLabel,
  findAllListening,
  findByPort,
  findByPorts,
  findConfig,
  getProcessDetail,
  isSystemPort,
  killAll,
  killProcess,
  loadConfig,
  mergeProfileOpts,
  platform,
  resolveProfile,
  saveConfig,
  setPlatform,
} from '../src/api.js';

describe('API exports', () => {
  it('exports discovery functions', () => {
    expect(typeof findByPort).toBe('function');
    expect(typeof findByPorts).toBe('function');
    expect(typeof findAllListening).toBe('function');
  });

  it('exports killer functions', () => {
    expect(typeof killProcess).toBe('function');
    expect(typeof killAll).toBe('function');
  });

  it('exports label utilities', () => {
    expect(typeof enrichLabel).toBe('function');
    expect(typeof isSystemPort).toBe('function');
  });

  it('exports platform functions', () => {
    expect(typeof platform).toBe('function');
    expect(typeof setPlatform).toBe('function');
  });

  it('exports SlayError', () => {
    expect(typeof SlayError).toBe('function');
  });

  it('exports config functions', () => {
    expect(typeof findConfig).toBe('function');
    expect(typeof loadConfig).toBe('function');
    expect(typeof saveConfig).toBe('function');
    expect(typeof resolveProfile).toBe('function');
    expect(typeof mergeProfileOpts).toBe('function');
  });

  it('exports getProcessDetail', () => {
    expect(typeof getProcessDetail).toBe('function');
  });
});
