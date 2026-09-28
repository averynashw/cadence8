import { backspace, countCompletedGroups, createRun, enterKey, getRunStatus } from './run-state';
import type { TargetSequence } from './target-sequence';

describe('createRun', () => {
  it('initializes a run with no player input', () => {
    const sequence: TargetSequence = [['a', 's'], ['j', 'k']];
    const run = createRun(sequence);
    expect(run).toEqual({
      sequence,
      inputBuffer: [],
      forwardInputHistory: [],
      startedAt: null,
      completedAt: null,
    });
  });
});

describe('getRunStatus', () => {
  it('returns ready before the first forward input', () => {
    const run = createRun([['a', 's'], ['j', 'k']]);
    expect(getRunStatus(run)).toBe('ready');
  });

  it('returns active after backspacing all input', () => {
    const run = backspace(enterKey(createRun([['a', 's'], ['j', 'k']]), 'a', 0));
    expect(getRunStatus(run)).toBe('active');
  });

  it('returns complete when only earlier groups contain errors', () => {
    const run = enterKey(enterKey(createRun([['a'], ['j']]), 's', 0), 'j', 100);
    expect(getRunStatus(run)).toBe('complete');
  });

  it('returns active when the final group contains an error', () => {
    let run = createRun([['a'], ['j', 'k']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 'l', 100);
    run = enterKey(run, 'k', 200);
    expect(getRunStatus(run)).toBe('active');
  });
});

describe('countCompletedGroups', () => {
  it('counts a group while all its positions are entered, errors included', () => {
    let run = createRun([['a', 's'], ['j', 'k'], ['d']]);
    expect(countCompletedGroups(run)).toBe(0);
    run = enterKey(run, 'a', 0);
    expect(countCompletedGroups(run)).toBe(0);
    run = enterKey(run, 'f', 100);
    expect(countCompletedGroups(run)).toBe(1);
    run = backspace(run);
    expect(countCompletedGroups(run)).toBe(0);
  });

  it('counts the final group only once the run is complete', () => {
    let run = createRun([['a'], ['j']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 'k', 100);
    expect(countCompletedGroups(run)).toBe(1);
    run = enterKey(backspace(run), 'j', 200);
    expect(countCompletedGroups(run)).toBe(2);
  });
});

describe('enterKey', () => {
  const sequence: TargetSequence = [['a', 's'], ['j', 'k']];

  it('records the expected key across group boundaries', () => {
    let run = createRun(sequence);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 's', 10);
    run = enterKey(run, 'l', 20);
    expect(run.inputBuffer).toEqual(['a', 's', 'l']);
    expect(run.forwardInputHistory.at(-1)).toEqual({ expected: 'j', actual: 'l', time: 20 });
  });

  it('starts timing on the first input instead of at creation', () => {
    let run = createRun(sequence);
    run = enterKey(run, 'a', 500);
    run = enterKey(run, 's', 600);
    expect(run.startedAt).toBe(500);
    expect(run.completedAt).toBeNull();
  });

  it('records the completion time on the final key', () => {
    let run = createRun(sequence);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 's', 100);
    run = enterKey(run, 'j', 200);
    run = enterKey(run, 'k', 300);
    expect(getRunStatus(run)).toBe('complete');
    expect(run.completedAt).toBe(300);
  });

  it('ignores input after completion', () => {
    let run = createRun([['a']]);
    run = enterKey(run, 'a', 0);
    expect(enterKey(run, 's', 100)).toBe(run);
  });

  it('ignores input past a final group with an error', () => {
    let run = createRun([['a']]);
    run = enterKey(run, 's', 0);
    expect(enterKey(run, 'a', 100)).toBe(run);
    expect(run.completedAt).toBeNull();
  });
});

describe('backspace', () => {
  it('removes the latest input but keeps its history', () => {
    let run = createRun([['a', 's', 'd']]);
    run = enterKey(run, 'f', 0);
    run = backspace(run);
    expect(run.inputBuffer).toEqual([]);
    expect(run.forwardInputHistory).toEqual([{ expected: 'a', actual: 'f', time: 0 }]);
    expect(run.startedAt).toBe(0);
  });

  it('expects the same key again after backspacing a mistake', () => {
    let run = createRun([['a', 's', 'd']]);
    run = enterKey(run, 'f', 0);
    run = backspace(run);
    run = enterKey(run, 'a', 100);
    expect(run.inputBuffer).toEqual(['a']);
    expect(run.forwardInputHistory).toEqual([
      { expected: 'a', actual: 'f', time: 0 },
      { expected: 'a', actual: 'a', time: 100 },
    ]);
  });

  it('completes once a final-group error is fixed', () => {
    let run = createRun([['a']]);
    run = enterKey(run, 's', 0);
    run = backspace(run);
    run = enterKey(run, 'a', 100);
    expect(getRunStatus(run)).toBe('complete');
    expect(run.completedAt).toBe(100);
  });

  it('does nothing on an empty buffer', () => {
    const run = createRun([['a']]);
    expect(backspace(run)).toBe(run);
  });

  it('does nothing after completion', () => {
    let run = createRun([['a']]);
    run = enterKey(run, 'a', 0);
    expect(backspace(run)).toBe(run);
  });
});
