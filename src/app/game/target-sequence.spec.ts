import { countTargets, type TargetSequence } from './target-sequence';

describe('countTargets', () => {
  it('counts targets across groups', () => {
    const sequence: TargetSequence = [['a', 's', 'd'], ['j', 'k']];
    expect(countTargets(sequence)).toBe(5);
  });
});
