import { SCORING_VERSION, scoreRun } from './run-score';
import { backspace, createRun, enterKey } from './run-state';

describe('scoreRun', () => {
  it('returns null for an incomplete run', () => {
    let run = createRun([['a', 's']]);
    expect(scoreRun(run)).toBeNull();
    run = enterKey(run, 'a', 0);
    expect(scoreRun(run)).toBeNull();
  });

  it('scores every metric for a clean run', () => {
    let run = createRun([['a', 's'], ['j', 'k']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 's', 500);
    run = enterKey(run, 'j', 1000);
    run = enterKey(run, 'k', 1500);
    expect(scoreRun(run)).toEqual({
      scoringVersion: SCORING_VERSION,
      accuracy: 1,
      keysPerMinute: 160,
      rawKeysPerMinute: 160,
      consistency: 1,
      elapsedMs: 1500,
    });
  });

  it('counts corrected mistakes in accuracy and raw speed but not speed', () => {
    let run = createRun([['a', 's']]);
    run = enterKey(run, 'f', 0);
    run = backspace(run);
    run = enterKey(run, 'a', 1000);
    run = enterKey(run, 's', 2000);
    const score = scoreRun(run);
    expect(score?.accuracy).toBeCloseTo(2 / 3);
    expect(score?.keysPerMinute).toBe(60);
    expect(score?.rawKeysPerMinute).toBe(90);
  });

  it('excludes uncorrected errors in earlier groups from speed', () => {
    let run = createRun([['a', 's'], ['j']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 'd', 1000);
    run = enterKey(run, 'j', 2000);
    expect(scoreRun(run)?.keysPerMinute).toBe(60);
  });

  it('keeps full consistency when each second has the same pace', () => {
    let run = createRun([['a', 's', 'd'], ['j', 'k']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 's', 500);
    run = enterKey(run, 'd', 1000);
    run = enterKey(run, 'j', 1500);
    run = enterKey(run, 'k', 2000);
    expect(scoreRun(run)?.consistency).toBe(1);
  });

  it('lowers consistency when the pace changes between seconds', () => {
    let run = createRun([['a', 's', 'd'], ['j', 'k']]);
    run = enterKey(run, 'a', 0);
    run = enterKey(run, 's', 200);
    run = enterKey(run, 'd', 400);
    run = enterKey(run, 'j', 600);
    run = enterKey(run, 'k', 2000);
    const consistency = scoreRun(run)?.consistency ?? 1;
    expect(consistency).toBeGreaterThan(0);
    expect(consistency).toBeLessThan(0.5);
  });

  it('reports zero speed for a one-key run', () => {
    let run = createRun([['a']]);
    run = enterKey(run, 'a', 0);
    expect(scoreRun(run)).toEqual(expect.objectContaining({ keysPerMinute: 0, elapsedMs: 0 }));
  });
});
