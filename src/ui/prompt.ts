import { createInterface } from 'node:readline';
import { c, isTTY } from './colors.js';
import { withRawMode } from './raw-mode.js';

export async function confirm(message: string): Promise<boolean> {
  if (!isTTY()) return true; // Non-interactive: default yes

  return new Promise((resolve) => {
    process.stdout.write(`${message} ${c.dim('[y/N]')} `);

    const { stdin } = process;

    withRawMode(stdin, (cleanup) => {
      const onData = (key: string) => {
        stdin.removeListener('data', onData);
        cleanup();

        const char = key.toLowerCase();

        if (char === 'y') {
          process.stdout.write(`${c.green('y')}\n`);
          resolve(true);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.stdout.write('\n');
          process.exit(130);
        } else {
          process.stdout.write(`${c.red('n')}\n`);
          resolve(false);
        }
      };

      stdin.on('data', onData);
    });
  });
}

export async function textInput(message: string): Promise<string> {
  if (!isTTY()) return '';

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
