import { describe, expect, it, vi } from 'vitest';

// Mock isTTY before importing animation module
vi.mock('../src/ui/colors.js', async () => {
  const actual = await vi.importActual<typeof import('../src/ui/colors.js')>('../src/ui/colors.js');
  return {
    ...actual,
    isTTY: vi.fn(() => false),
  };
});

import { playKillAnimation } from '../src/ui/animation.js';
import { isTTY } from '../src/ui/colors.js';

describe('playKillAnimation', () => {
  it('skips animation when not TTY', async () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await playKillAnimation();
    expect(writeSpy).not.toHaveBeenCalled();
    writeSpy.mockRestore();
  });

  it('runs animation when TTY', async () => {
    vi.mocked(isTTY).mockReturnValue(true);
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await playKillAnimation();
    expect(writeSpy).toHaveBeenCalled();
    writeSpy.mockRestore();
    vi.mocked(isTTY).mockReturnValue(false);
  });
});
