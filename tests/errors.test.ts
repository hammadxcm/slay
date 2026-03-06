import { describe, expect, it } from 'vitest';
import { KillErrorCode } from '../src/types.js';
import { SlayError, isPermissionError } from '../src/utils/errors.js';

describe('SlayError', () => {
  it('creates error with code and message', () => {
    const err = new SlayError(KillErrorCode.NOT_FOUND);
    expect(err.code).toBe(KillErrorCode.NOT_FOUND);
    expect(err.message).toBe('No process found on port');
    expect(err.name).toBe('SlayError');
  });

  it('appends detail to message', () => {
    const err = new SlayError(KillErrorCode.PERMISSION_DENIED, 'port 80');
    expect(err.message).toBe('Permission denied. Try: sudo slay: port 80');
    expect(err.detail).toBe('port 80');
  });

  it('handles all error codes', () => {
    expect(new SlayError(KillErrorCode.ALREADY_DEAD).message).toBe('Process already terminated');
    expect(new SlayError(KillErrorCode.INVALID_PORT).message).toBe('Invalid port. Must be 1-65535');
    expect(new SlayError(KillErrorCode.COMMAND_FAILED).message).toBe('Command execution failed');
    expect(new SlayError(KillErrorCode.TIMEOUT).message).toBe('Operation timed out');
  });

  it('is instanceof Error', () => {
    const err = new SlayError(KillErrorCode.NOT_FOUND);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('isPermissionError', () => {
  it('detects "permission denied"', () => {
    expect(isPermissionError('Error: permission denied')).toBe(true);
  });

  it('detects "operation not permitted"', () => {
    expect(isPermissionError('Operation not permitted')).toBe(true);
  });

  it('detects "access denied"', () => {
    expect(isPermissionError('Access Denied')).toBe(true);
  });

  it('detects "EPERM"', () => {
    expect(isPermissionError('EPERM: not allowed')).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isPermissionError('No such file or directory')).toBe(false);
    expect(isPermissionError('')).toBe(false);
  });
});
