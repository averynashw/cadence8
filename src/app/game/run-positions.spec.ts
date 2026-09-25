import { describePositions } from './run-positions';
import { backspace, createRun, enterKey } from './run-state';

describe('describePositions', () => {
  it('marks the first position current in a fresh run', () => {
    const run = createRun([['a', 's'], ['j']]);
    expect(describePositions(run)).toEqual([
      [
        { key: 'a', state: 'current', correct: null },
        { key: 's', state: 'upcoming', correct: null },
      ],
      [{ key: 'j', state: 'upcoming', correct: null }],
    ]);
  });

  it('marks entered positions completed with their correctness', () => {
    let run = createRun([['a', 's'], ['j']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 'd', 100);
    expect(describePositions(run)).toEqual([
      [
        { key: 'a', state: 'completed', correct: true },
        { key: 's', state: 'completed', correct: false },
      ],
      [{ key: 'j', state: 'current', correct: null }],
    ]);
  });

  it('returns a backspaced position to current', () => {
    let run = createRun([['a', 's']]);
    run = enterKey(run, 'd', 0);
    run = backspace(run);
    expect(describePositions(run)[0][0]).toEqual({ key: 'a', state: 'current', correct: null });
  });

  it('has no current position once the run is complete', () => {
    let run = createRun([['a'], ['j']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 'j', 100);
    const states = describePositions(run).flat().map((position) => position.state);
    expect(states).toEqual(['completed', 'completed']);
  });
});
