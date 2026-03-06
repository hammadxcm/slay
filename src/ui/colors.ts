import pc from 'picocolors';

export const c = {
  red: pc.red,
  green: pc.green,
  yellow: pc.yellow,
  blue: pc.blue,
  cyan: pc.cyan,
  gray: pc.gray,
  bold: pc.bold,
  dim: pc.dim,
};

export function isTTY(): boolean {
  return process.stdout.isTTY === true;
}
