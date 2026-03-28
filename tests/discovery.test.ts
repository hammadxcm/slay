import { describe, expect, it, vi } from 'vitest';
import { findAllListening, findByName, findByPort, findByPorts } from '../src/core/discovery.js';
import { PROC_NGINX, PROC_NODE, mockAdapter, mockAdapterWithProcesses } from './helpers.js';

describe('discovery', () => {
  const procs = [PROC_NODE, PROC_NGINX];

  it('findByPort returns matching processes with labels', async () => {
    const adapter = mockAdapterWithProcesses(procs);
    const result = await findByPort(adapter, 3000);
    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(100);
    expect(result[0].label).toBeDefined();
  });

  it('findByPort returns empty for no match', async () => {
    const adapter = mockAdapterWithProcesses(procs);
    const result = await findByPort(adapter, 9999);
    expect(result).toHaveLength(0);
  });

  it('findAllListening returns all processes', async () => {
    const adapter = mockAdapterWithProcesses(procs);
    const result = await findAllListening(adapter);
    expect(result).toHaveLength(2);
  });

  it('findByPorts aggregates results', async () => {
    const adapter = mockAdapterWithProcesses(procs);
    const result = await findByPorts(adapter, [3000, 8080]);
    expect(result).toHaveLength(2);
  });

  it('findByName returns enriched results', async () => {
    const adapter = mockAdapter({
      findByName: vi.fn(async () => [{ pid: 500, port: 0, state: 'RUNNING', command: 'node' }]),
    });
    const result = await findByName(adapter, 'node');
    expect(result).toHaveLength(1);
    expect(result[0].pid).toBe(500);
    expect(result[0].label).toBeDefined();
  });
});
