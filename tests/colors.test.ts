import { describe, expect, it } from 'vitest';
import { c, isTTY } from '../src/ui/colors.js';

describe('colors', () => {
  it('exports color functions', () => {
    expect(typeof c.red).toBe('function');
    expect(typeof c.green).toBe('function');
    expect(typeof c.yellow).toBe('function');
    expect(typeof c.blue).toBe('function');
    expect(typeof c.cyan).toBe('function');
    expect(typeof c.gray).toBe('function');
    expect(typeof c.bold).toBe('function');
    expect(typeof c.dim).toBe('function');
  });

  it('color functions return strings', () => {
    expect(typeof c.red('test')).toBe('string');
    expect(typeof c.bold('test')).toBe('string');
  });
});

describe('isTTY', () => {
  it('returns a boolean', () => {
    expect(typeof isTTY()).toBe('boolean');
  });
});
