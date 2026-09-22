import { createRun, getRunStatus, type RunState } from './run-state';
import type { TargetSequence } from './target-sequence';

describe('createRun', () => {
  it('initializes a run with no player input', () => {
    const sequence: TargetSequence = [['a', 's'], ['j', 'k']];
    const run = createRun(sequence);
    expect(run).toEqual({
      sequence,
      inputBuffer: [],
      forwardInputHistory: [],
    });
  });
});

describe('getRunStatus', () => {
  it('returns ready before the first forward input', () => {
    const sequence: TargetSequence = [['a', 's'], ['j', 'k']];
    const run = createRun(sequence);
    expect(getRunStatus(run)).toBe('ready');
  });

  it('returns active after the input buffer is cleared', () => {
    const sequence: TargetSequence = [['a', 's'], ['j', 'k']];
    const run: RunState = {
      sequence,
      inputBuffer: [],
      forwardInputHistory: [
        {
          expected: 'a',
          actual: 'a',
        },
      ],
    };
    expect(getRunStatus(run)).toBe('active');
  });

  it('returns complete when every target position has input', () => {
    const sequence: TargetSequence = [['a'], ['j']];
    const run: RunState = {
      sequence,
      inputBuffer: ['a', 'k'],
      forwardInputHistory: [
        {
          expected: 'a',
          actual: 'a',
        },
        {
          expected: 'j',
          actual: 'k',
        },
      ],
    };
    expect(getRunStatus(run)).toBe('complete');
  });
});
