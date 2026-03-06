import type { PlatformAdapter, Protocol } from '../types.js';
import { createUnixAdapter, unix } from './unix.js';
import { createWindowsAdapter, windows } from './windows.js';

function getPlatform(protocol: Protocol = 'tcp'): PlatformAdapter {
  if (protocol === 'udp') {
    return process.platform === 'win32' ? createWindowsAdapter('udp') : createUnixAdapter('udp');
  }
  if (process.platform === 'win32') {
    return windows;
  }
  return unix;
}

let _platform: PlatformAdapter | null = null;

export function platform(protocol: Protocol = 'tcp'): PlatformAdapter {
  if (protocol === 'udp') {
    // UDP adapters are not cached since they're less common
    return getPlatform('udp');
  }
  if (!_platform) {
    _platform = getPlatform();
  }
  return _platform;
}

export function setPlatform(adapter: PlatformAdapter): void {
  _platform = adapter;
}
