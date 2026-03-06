import { c, isTTY } from './colors.js';

const BULLET_FRAMES = [
  '  *                              ',
  '      *                          ',
  '          *                      ',
  '              *                  ',
  '                  *              ',
  '                      *         ',
  '                          *     ',
  '                             *  ',
];

const EXPLOSION = [
  '                              . ',
  '                             *  ',
  '                            *** ',
  '                           *****',
  '                            *** ',
  '                             *  ',
];

const FRAME_DELAY = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function playKillAnimation(): Promise<void> {
  if (!isTTY()) return;

  process.stdout.write('\n');

  // Bullet flying
  for (const frame of BULLET_FRAMES) {
    process.stdout.write(`\r  ${c.yellow(frame)}`);
    await sleep(FRAME_DELAY);
  }

  // Explosion
  for (const frame of EXPLOSION) {
    process.stdout.write(`\r  ${c.red(frame)}`);
    await sleep(FRAME_DELAY + 20);
  }

  // Clear line
  process.stdout.write(`\r${' '.repeat(40)}\r`);
}
