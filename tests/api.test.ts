import { describe, expect, it } from 'vitest';
import {
  SlayError,
  checkPort,
  checkPorts,
  enrichLabel,
  excludeProcesses,
  findAllListening,
  findByName,
  findByPort,
  findByPorts,
  findConfig,
  findNextAvailable,
  getProcessDetail,
  isPortFree,
  isSystemPort,
  killAll,
  killProcess,
  loadConfig,
  matchesPattern,
  mergeProfileOpts,
  platform,
  resolveProfile,
  runHook,
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

  it('exports check functions', () => {
    expect(typeof checkPort).toBe('function');
    expect(typeof checkPorts).toBe('function');
    expect(typeof findNextAvailable).toBe('function');
    expect(typeof isPortFree).toBe('function');
  });

  it('exports filter functions', () => {
    expect(typeof matchesPattern).toBe('function');
    expect(typeof excludeProcesses).toBe('function');
  });

  it('exports hook function', () => {
    expect(typeof runHook).toBe('function');
  });

  it('exports findByName', () => {
    expect(typeof findByName).toBe('function');
  });
});
