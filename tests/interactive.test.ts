import { afterEach, describe, expect, it, vi } from 'vitest';

let mockIsTTY = false;

vi.mock('../src/ui/colors.js', async () => {
  const actual = await vi.importActual<typeof import('../src/ui/colors.js')>('../src/ui/colors.js');
  return {
    ...actual,
    isTTY: () => mockIsTTY,
  };
});

import type { ProcessInfo } from '../src/types.js';
import { filterProcesses, selectProcesses } from '../src/ui/interactive.js';
import { PROC_NGINX, PROC_NODE, PROC_POSTGRES, createMockStdin } from './helpers.js';

const procs: ProcessInfo[] = [{ ...PROC_NODE, label: 'Node.js' }, PROC_NGINX, PROC_POSTGRES];

function setupTTY(initialIsRaw?: boolean) {
  const mockStdin = createMockStdin(initialIsRaw);
  const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const originalStdin = process.stdin;
  Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });
  return {
    mockStdin,
    writeSpy,
    cleanup: () => {
      Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true });
      writeSpy.mockRestore();
    },
  };
}

describe('selectProcesses', () => {
  afterEach(() => {
    mockIsTTY = false;
  });

  it('returns all processes when not TTY', async () => {
    mockIsTTY = false;
    const result = await selectProcesses(procs);
    expect(result).toEqual(procs);
  });

  it('returns empty array when given empty array (TTY)', async () => {
    mockIsTTY = true;
    const result = await selectProcesses([]);
    expect(result).toEqual([]);
  });

  it('returns empty array when given empty array (non-TTY)', async () => {
    mockIsTTY = false;
    const result = await selectProcesses([]);
    expect(result).toEqual([]);
  });

  it('selects process with space and confirms with enter', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    // Toggle first item, then confirm
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(100);
    cleanup();
  });

  it('navigates down and selects', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    // Move down, select, confirm
    mockStdin.emit('data', '\u001B[B'); // down arrow
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(200);
    cleanup();
  });

  it('navigates up with arrow key', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '\u001B[B'); // down
    mockStdin.emit('data', '\u001B[A'); // up (back to first)
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(100);
    cleanup();
  });

  it('navigates with j/k keys', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', 'j'); // down
    mockStdin.emit('data', 'j'); // down again
    mockStdin.emit('data', 'k'); // up
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\n'); // enter (newline variant)
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(200);
    cleanup();
  });

  it('toggles all with "a"', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', 'a'); // select all
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(3);
    cleanup();
  });

  it('toggles all on then off', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', 'a'); // select all
    mockStdin.emit('data', 'a'); // deselect all
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(0);
    cleanup();
  });

  it('deselects a toggled item', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', ' '); // toggle on
    mockStdin.emit('data', ' '); // toggle off
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(0);
    cleanup();
  });

  it('exits on q', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    selectProcesses(procs);
    mockStdin.emit('data', 'q');

    expect(exitSpy).toHaveBeenCalledWith(130);
    exitSpy.mockRestore();
    cleanup();
  });

  it('exits on Ctrl+C', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    selectProcesses(procs);
    mockStdin.emit('data', '\u0003');

    expect(exitSpy).toHaveBeenCalledWith(130);
    exitSpy.mockRestore();
    cleanup();
  });

  it('clamps cursor at top', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '\u001B[A'); // up at top — should stay at 0
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result[0].pid).toBe(100);
    cleanup();
  });

  it('clamps cursor at bottom', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    // Move down past the end
    mockStdin.emit('data', 'j');
    mockStdin.emit('data', 'j');
    mockStdin.emit('data', 'j');
    mockStdin.emit('data', 'j');
    mockStdin.emit('data', ' ');
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(300); // last item
    cleanup();
  });

  it('restores stdin state after confirm', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '\r');
    await promise;

    expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
    expect(mockStdin.pause).toHaveBeenCalled();
    cleanup();
  });

  it('handles undefined isRaw (nullish coalescing fallback)', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY(undefined);

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '\r');
    await promise;

    // wasRaw was undefined, so ?? false should pass false
    expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
    cleanup();
  });

  it('enters search mode with / and filters by query', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'n');
    mockStdin.emit('data', 'o');
    mockStdin.emit('data', 'd');
    mockStdin.emit('data', 'e');
    mockStdin.emit('data', '\r'); // confirm search
    mockStdin.emit('data', ' '); // toggle first visible
    mockStdin.emit('data', '\r'); // confirm selection
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(100);
    cleanup();
  });

  it('exits search mode with Escape', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'n');
    mockStdin.emit('data', '\u001B'); // escape
    // All procs should be visible again
    mockStdin.emit('data', 'a'); // select all
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(3);
    cleanup();
  });

  it('handles backspace in search mode', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', '\u007F'); // backspace
    mockStdin.emit('data', '\u007F'); // backspace
    mockStdin.emit('data', '\r'); // confirm search (empty = all visible)
    mockStdin.emit('data', 'a'); // select all
    mockStdin.emit('data', '\r');
    const result = await promise;

    expect(result).toHaveLength(3);
    cleanup();
  });

  it('clamps cursor when search narrows to no results', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', 'j'); // move cursor down
    mockStdin.emit('data', 'j'); // cursor at index 2
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', 'z'); // no results, cursor should clamp to 0
    mockStdin.emit('data', '\u001B'); // escape
    mockStdin.emit('data', '\r'); // confirm
    const result = await promise;

    expect(result).toHaveLength(0);
    cleanup();
  });

  it('ignores control characters in search mode that do not match handlers', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'n');
    // Send a control character that doesn't match any handler (e.g., \x01 = Ctrl+A)
    mockStdin.emit('data', '\x01');
    mockStdin.emit('data', '\r'); // confirm search
    mockStdin.emit('data', ' '); // toggle
    mockStdin.emit('data', '\r'); // confirm
    const result = await promise;

    // Only 'n' was typed as search, \x01 was ignored (key < ' ')
    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(100); // node matches 'n'
    cleanup();
  });

  it('ignores space toggle when no visible items', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();

    const promise = selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', 'z');
    mockStdin.emit('data', 'z'); // no results
    mockStdin.emit('data', '\r'); // confirm search (stay in select mode with no visible)
    mockStdin.emit('data', ' '); // toggle - should be ignored since no visible items
    mockStdin.emit('data', '\r'); // confirm selection
    const result = await promise;

    expect(result).toHaveLength(0);
    cleanup();
  });

  it('Ctrl+C exits during search mode', async () => {
    mockIsTTY = true;
    const { mockStdin, cleanup } = setupTTY();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    selectProcesses(procs);
    mockStdin.emit('data', '/'); // enter search
    mockStdin.emit('data', '\u0003'); // Ctrl+C during search

    expect(exitSpy).toHaveBeenCalledWith(130);
    exitSpy.mockRestore();
    cleanup();
  });
});

describe('filterProcesses', () => {
  it('returns all indices for empty query', () => {
    expect(filterProcesses(procs, '')).toEqual([0, 1, 2]);
  });

  it('filters by command', () => {
    expect(filterProcesses(procs, 'node')).toEqual([0]);
  });

  it('filters by port', () => {
    expect(filterProcesses(procs, '8080')).toEqual([1]);
  });

  it('filters by PID', () => {
    // '300' matches port 3000 (index 0) and PID 300 (index 2)
    expect(filterProcesses(procs, '300')).toEqual([0, 2]);
  });

  it('filters by label', () => {
    expect(filterProcesses(procs, 'Node.js')).toEqual([0]);
  });

  it('is case insensitive', () => {
    expect(filterProcesses(procs, 'NODE')).toEqual([0]);
  });

  it('returns empty for no match', () => {
    expect(filterProcesses(procs, 'zzzzz')).toEqual([]);
  });
});
