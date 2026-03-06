export type Protocol = 'tcp' | 'udp';

export interface ProcessInfo {
  pid: number;
  port: number;
  state: string;
  command?: string;
  label?: string;
  protocol?: Protocol;
}

export interface PlatformAdapter {
  findByPort(port: number): Promise<ProcessInfo[]>;
  findAllListening(): Promise<ProcessInfo[]>;
  kill(pid: number, signal: 'SIGTERM' | 'SIGKILL'): Promise<boolean>;
  isAlive(pid: number): Promise<boolean>;
}

export interface KillResult {
  pid: number;
  port: number;
  success: boolean;
  signal: string;
  error?: string;
  elapsed?: number;
}

export interface CliOptions {
  ports: number[];
  force: boolean;
  yes: boolean;
  soft: boolean;
  verbose: boolean;
  all: boolean;
  json: boolean;
  watch: boolean;
  interactive: boolean;
  dryRun: boolean;
  tree: boolean;
  protocol: Protocol;
  help: boolean;
}

export enum KillErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_DEAD = 'ALREADY_DEAD',
  INVALID_PORT = 'INVALID_PORT',
  COMMAND_FAILED = 'COMMAND_FAILED',
  TIMEOUT = 'TIMEOUT',
}
