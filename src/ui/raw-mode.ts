export function withRawMode(stdin: NodeJS.ReadStream, fn: (cleanup: () => void) => void): void {
  const wasRaw = stdin.isRaw;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  const cleanup = () => {
    stdin.setRawMode(wasRaw ?? false);
    stdin.pause();
  };

  fn(cleanup);
}
