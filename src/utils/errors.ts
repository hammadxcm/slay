export { KillErrorCode } from '../types.js';
import { KillErrorCode } from '../types.js';

const ERROR_MESSAGES: Record<KillErrorCode, string> = {
  [KillErrorCode.PERMISSION_DENIED]: 'Permission denied. Try: sudo slay',
  [KillErrorCode.NOT_FOUND]: 'No process found on port',
  [KillErrorCode.ALREADY_DEAD]: 'Process already terminated',
  [KillErrorCode.INVALID_PORT]: 'Invalid port. Must be 1-65535',
  [KillErrorCode.COMMAND_FAILED]: 'Command execution failed',
  [KillErrorCode.TIMEOUT]: 'Operation timed out',
};

export class SlayError extends Error {
  constructor(
    public code: KillErrorCode,
    public detail?: string,
  ) {
    super(detail ? `${ERROR_MESSAGES[code]}: ${detail}` : ERROR_MESSAGES[code]);
    this.name = 'SlayError';
  }
}

export function isPermissionError(stderr: string): boolean {
  return /permission denied|operation not permitted|access denied|eperm/i.test(stderr);
}
