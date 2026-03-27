import type { ProcessDetail } from '../types.js';
import { exec, isWmicAvailable } from '../utils/exec.js';

function formatMemory(rssKb: number): string {
  if (rssKb >= 1024 * 1024) return `${(rssKb / (1024 * 1024)).toFixed(1)}GB`;
  if (rssKb >= 1024) return `${Math.round(rssKb / 1024)}MB`;
  return `${rssKb}KB`;
}

function formatUptime(etime: string): string {
  // etime formats: MM:SS, HH:MM:SS, D-HH:MM:SS
  const trimmed = etime.trim();
  const dayMatch = trimmed.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
  if (dayMatch) {
    const days = Number.parseInt(dayMatch[1], 10);
    const hours = Number.parseInt(dayMatch[2], 10);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${dayMatch[3]}m`;
  }
  const hhmmss = trimmed.match(/^(\d+):(\d+):(\d+)$/);
  if (hhmmss) {
    const h = Number.parseInt(hhmmss[1], 10);
    const m = Number.parseInt(hhmmss[2], 10);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${hhmmss[3]}s`;
  }
  const mmss = trimmed.match(/^(\d+):(\d+)$/);
  if (mmss) {
    const m = Number.parseInt(mmss[1], 10);
    const s = Number.parseInt(mmss[2], 10);
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }
  return trimmed;
}

export async function getProcessDetail(pid: number): Promise<ProcessDetail | null> {
  if (process.platform === 'win32') {
    return getWindowsDetail(pid);
  }
  return getUnixDetail(pid);
}

async function getUnixDetail(pid: number): Promise<ProcessDetail | null> {
  try {
    const { stdout } = await exec(`ps -p ${pid} -o %cpu=,rss=,user=,etime= 2>/dev/null`);
    const line = stdout.trim();
    if (!line) return null;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) return null;

    const cpu = `${parts[0]}%`;
    const rssKb = Number.parseInt(parts[1], 10);
    const memory = Number.isNaN(rssKb) ? parts[1] : formatMemory(rssKb);
    const user = parts[2];
    const uptime = formatUptime(parts[3]);

    return { cpu, memory, user, uptime };
  } catch {
    return null;
  }
}

async function getWindowsDetail(pid: number): Promise<ProcessDetail | null> {
  const useWmic = await isWmicAvailable();
  if (useWmic) {
    return getWindowsDetailWmic(pid);
  }
  return getWindowsDetailPowerShell(pid);
}

async function getWindowsDetailWmic(pid: number): Promise<ProcessDetail | null> {
  try {
    const { stdout } = await exec(
      `wmic process where ProcessId=${pid} get PercentProcessorTime,WorkingSetSize,Name /format:csv 2>nul`,
    );
    const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;

    const parts = lines[1].split(',');
    if (parts.length < 4) return null;

    const cpu = `${parts[2] || '0'}%`;
    const wsBytes = Number.parseInt(parts[3], 10);
    const memory = Number.isNaN(wsBytes) ? '0KB' : formatMemory(Math.round(wsBytes / 1024));

    // Get username
    let user = '';
    try {
      const { stdout: userOut } = await exec(
        `wmic process where ProcessId=${pid} get /format:csv 2>nul`,
      );
      const userMatch = userOut.match(/(\w+)\\(\w+)/);
      if (userMatch) user = userMatch[2];
    } catch {
      // ignore
    }

    return { cpu, memory, user, uptime: '' };
  } catch {
    return null;
  }
}

async function getWindowsDetailPowerShell(pid: number): Promise<ProcessDetail | null> {
  try {
    const { stdout } = await exec(
      `powershell -NoProfile -Command "Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object CPU,WorkingSet64 | ConvertTo-Csv -NoTypeInformation"`,
    );
    const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;

    const parts = lines[1].replace(/"/g, '').split(',');
    if (parts.length < 2) return null;

    const cpuSeconds = Number.parseFloat(parts[0]) || 0;
    const cpu = `${cpuSeconds.toFixed(1)}%`;
    const wsBytes = Number.parseInt(parts[1], 10);
    const memory = Number.isNaN(wsBytes) ? '0KB' : formatMemory(Math.round(wsBytes / 1024));

    // Get owner
    let user = '';
    try {
      const { stdout: ownerOut } = await exec(
        `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').GetOwner().User"`,
      );
      user = ownerOut.trim();
    } catch {
      // ignore
    }

    return { cpu, memory, user, uptime: '' };
  } catch {
    return null;
  }
}
