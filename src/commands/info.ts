import { findByPorts } from '../core/discovery.js';
import { findChildren } from '../core/tree.js';
import { getProcessDetail } from '../platform/detail.js';
import { platform } from '../platform/index.js';
import { c } from '../ui/colors.js';

export async function runInfo(ports: number[]): Promise<void> {
  if (ports.length === 0) {
    console.error(`\n  ${c.red('Usage: slay info <port> [port...]')}\n`);
    process.exit(1);
  }

  const adapter = platform('tcp');
  const processes = await findByPorts(adapter, ports);

  if (processes.length === 0) {
    console.log(`\n  ${c.dim(`Nothing listening on port ${ports.join(', ')}`)}\n`);
    return;
  }

  console.log();
  console.log(
    `  ${c.dim('PORT'.padEnd(7))}${c.dim('PID'.padEnd(9))}${c.dim('COMMAND'.padEnd(12))}${c.dim('LABEL'.padEnd(16))}${c.dim('USER'.padEnd(10))}${c.dim('CPU'.padEnd(7))}${c.dim('MEM'.padEnd(9))}${c.dim('UPTIME')}`,
  );

  for (const proc of processes) {
    const detail = await getProcessDetail(proc.pid);
    const label = proc.label || '';
    const user = detail?.user || '';
    const cpu = detail?.cpu || '';
    const mem = detail?.memory || '';
    const uptime = detail?.uptime || '';

    console.log(
      `  ${String(proc.port).padEnd(7)}${String(proc.pid).padEnd(9)}${(proc.command || '').padEnd(12)}${label.padEnd(16)}${user.padEnd(10)}${cpu.padEnd(7)}${mem.padEnd(9)}${uptime}`,
    );

    // Show children
    try {
      const childPids = await findChildren(proc.pid);
      for (const childPid of childPids) {
        const childDetail = await getProcessDetail(childPid);
        const childCpu = childDetail?.cpu || '';
        const childMem = childDetail?.memory || '';
        console.log(
          `  ${c.dim('  └─')} ${String(childPid).padEnd(9)}${''.padEnd(12)}${''.padEnd(16)}${''.padEnd(10)}${childCpu.padEnd(7)}${childMem.padEnd(9)}`,
        );
      }
    } catch {
      // No children or unable to find
    }
  }
  console.log();
}
