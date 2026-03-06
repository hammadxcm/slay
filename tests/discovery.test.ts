import { describe, expect, it } from 'vitest';
import { findAllListening, findByPort, findByPorts } from '../src/core/discovery.js';
import { PROC_NGINX, PROC_NODE, mockAdapterWithProcesses } from './helpers.js';

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
});
