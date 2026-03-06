import type { ProcessInfo } from '../types.js';
import { c, isTTY } from './colors.js';
import { withRawMode } from './raw-mode.js';

export function filterProcesses(processes: ProcessInfo[], query: string): number[] {
  if (!query) return processes.map((_, i) => i);
  const q = query.toLowerCase();
  return processes
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const haystack = [String(p.port), String(p.pid), p.command || '', p.label || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .map(({ i }) => i);
}

export async function selectProcesses(processes: ProcessInfo[]): Promise<ProcessInfo[]> {
  if (!isTTY() || processes.length === 0) return processes;

  return new Promise((resolve) => {
    let cursor = 0;
    const selected = new Set<number>();
    let searchMode = false;
    let searchQuery = '';
    let visibleIndices = processes.map((_, i) => i);
    const { stdin, stdout } = process;

    function updateVisible() {
      visibleIndices = filterProcesses(processes, searchQuery);
      if (cursor >= visibleIndices.length) {
        cursor = Math.max(0, visibleIndices.length - 1);
      }
    }

    function render() {
      const totalLines = visibleIndices.length + (searchMode ? 3 : 2);
      // Move to start and clear
      stdout.write(`\x1B[${totalLines}A`);
      stdout.write('\x1B[J');

      if (searchMode) {
        stdout.write(
          `  ${c.bold('Search:')} ${searchQuery}${c.dim('_')}  ${c.dim('(esc=exit search)')}\n\n`,
        );
      } else {
        stdout.write(
          `  ${c.bold('Select processes to kill')} ${c.dim('(space=toggle, enter=confirm, /=search, a=all, q=quit)')}\n\n`,
        );
      }

      for (let vi = 0; vi < visibleIndices.length; vi++) {
        const i = visibleIndices[vi];
        const p = processes[i];
        const isCursor = vi === cursor;
        const isSelected = selected.has(i);
        const marker = isSelected ? c.green('[x]') : c.dim('[ ]');
        const pointer = isCursor ? c.cyan('>') : ' ';
        const label = p.label ? c.dim(` (${p.label})`) : '';
        const cmd = p.command ? c.cyan(p.command) : c.dim('unknown');
        const line = `${pointer} ${marker} ${c.bold(String(p.port))} ${c.dim('>')} ${cmd} ${c.dim(`PID ${p.pid}`)}${label}`;
        stdout.write(`  ${line}\n`);
      }
    }

    // Initial render (push lines first)
    stdout.write('\n'.repeat(processes.length + 2));
    render();

    withRawMode(stdin, (restoreMode) => {
      const cleanup = () => {
        stdin.removeListener('data', onKey);
        restoreMode();
      };

      const onKey = (key: string) => {
        if (key === '\u0003') {
          // Ctrl+C always exits
          cleanup();
          stdout.write('\n');
          process.exit(130);
        }

        if (searchMode) {
          if (key === '\u001B') {
            // Escape exits search
            searchMode = false;
            searchQuery = '';
            updateVisible();
          } else if (key === '\u007F' || key === '\b') {
            // Backspace
            searchQuery = searchQuery.slice(0, -1);
            updateVisible();
          } else if (key === '\r' || key === '\n') {
            // Enter confirms search and returns to select mode
            searchMode = false;
          } else if (key.length === 1 && key >= ' ') {
            searchQuery += key;
            updateVisible();
          }
          render();
          return;
        }

        if (key === 'q') {
          cleanup();
          stdout.write('\n');
          process.exit(130);
        }

        if (key === '/') {
          searchMode = true;
          searchQuery = '';
          // Push extra line for search bar
          stdout.write('\n');
          render();
          return;
        }

        if (key === '\u001B[A' || key === 'k') {
          // Up
          cursor = Math.max(0, cursor - 1);
        } else if (key === '\u001B[B' || key === 'j') {
          // Down
          cursor = Math.min(visibleIndices.length - 1, cursor + 1);
        } else if (key === ' ') {
          // Toggle
          if (visibleIndices.length > 0) {
            const realIndex = visibleIndices[cursor];
            if (selected.has(realIndex)) selected.delete(realIndex);
            else selected.add(realIndex);
          }
        } else if (key === 'a') {
          // Toggle all visible
          const allSelected = visibleIndices.every((i) => selected.has(i));
          if (allSelected) {
            for (const i of visibleIndices) selected.delete(i);
          } else {
            for (const i of visibleIndices) selected.add(i);
          }
        } else if (key === '\r' || key === '\n') {
          // Enter - confirm
          cleanup();
          stdout.write('\n');
          const result = [...selected].map((i) => processes[i]);
          resolve(result);
          return;
        }

        render();
      };

      stdin.on('data', onKey);
    });
  });
}
