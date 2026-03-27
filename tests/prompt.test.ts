import { afterEach, describe, expect, it, vi } from 'vitest';

let mockIsTTY = false;

vi.mock('../src/ui/colors.js', async () => {
  const actual = await vi.importActual<typeof import('../src/ui/colors.js')>('../src/ui/colors.js');
  return {
    ...actual,
    isTTY: () => mockIsTTY,
  };
});

import { confirm, textInput } from '../src/ui/prompt.js';
import { createMockStdin } from './helpers.js';

describe('confirm', () => {
  afterEach(() => {
    mockIsTTY = false;
  });

  it('returns true when not TTY (non-interactive default)', async () => {
    mockIsTTY = false;
    const result = await confirm('Kill?');
    expect(result).toBe(true);
  });

  it('returns true when user presses y', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    const promise = confirm('Kill?');
    mockStdin.emit('data', 'y');
    const result = await promise;

    expect(result).toBe(true);
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
  });

  it('returns false when user presses n', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    const promise = confirm('Kill?');
    mockStdin.emit('data', 'n');
    const result = await promise;

    expect(result).toBe(false);
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
  });

  it('returns false when user presses any non-y key', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    const promise = confirm('Kill?');
    mockStdin.emit('data', 'x');
    const result = await promise;

    expect(result).toBe(false);
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
  });

  it('exits on Ctrl+C', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    confirm('Kill?');
    mockStdin.emit('data', '\u0003');

    expect(exitSpy).toHaveBeenCalledWith(130);
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('restores raw mode after input', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    const promise = confirm('Kill?');
    mockStdin.emit('data', 'y');
    await promise;

    expect(mockStdin.setRawMode).toHaveBeenCalledWith(true);
    expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
    expect(mockStdin.pause).toHaveBeenCalled();
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
  });

  it('handles undefined isRaw (nullish coalescing fallback)', async () => {
    mockIsTTY = true;
    const mockStdin = createMockStdin(undefined);
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

    const promise = confirm('Kill?');
    mockStdin.emit('data', 'y');
    await promise;

    // wasRaw was undefined, so ?? false should pass false to setRawMode
    expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
    Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
    writeSpy.mockRestore();
  });
});

describe('textInput', () => {
  afterEach(() => {
    mockIsTTY = false;
  });

  it('returns empty string when not TTY', async () => {
    mockIsTTY = false;
    const result = await textInput('Enter name: ');
    expect(result).toBe('');
  });

  it('returns user input when TTY', async () => {
    mockIsTTY = true;

    const originalStdin = process.stdin;
    const originalStdout = process.stdout;

    try {
      const { Readable, Writable } = await import('node:stream');
      const mockInput = new Readable({
        read() {
          this.push('hello-world\n');
          this.push(null);
        },
      });
      const mockOutput = new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      });

      Object.defineProperty(process, 'stdin', { value: mockInput, configurable: true });
      Object.defineProperty(process, 'stdout', { value: mockOutput, configurable: true });

      const result = await textInput('Enter: ');
      expect(result).toBe('hello-world');
    } finally {
      Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
      Object.defineProperty(process, 'stdout', { value: originalStdout, configurable: true });
    }
  });
});
