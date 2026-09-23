import { GAME_KEYS, LEFT_HAND_KEYS, type GameKey } from './game-key';
import { createSeededRandom } from './seeded-random';
import { createAlternatingGroup, createRollGroup, generateSequence } from './sequence-generator';
import { countTargets } from './target-sequence';

function isLeftHand(key: GameKey): boolean {
  return (LEFT_HAND_KEYS as readonly GameKey[]).includes(key);
}

describe('createAlternatingGroup', () => {
  it('switches hands on every key', () => {
    const group = createAlternatingGroup(createSeededRandom(1), 5);
    const hands = group.map(isLeftHand);
    expect(hands.every((left, i) => i === 0 || left !== hands[i - 1])).toBe(true);
  });
});

describe('createRollGroup', () => {
  it('rolls across adjacent keys on one hand', () => {
    const group = createRollGroup(createSeededRandom(1), 4);
    const indexes = group.map((key) => GAME_KEYS.indexOf(key));
    const step = indexes[1] - indexes[0];
    expect(Math.abs(step)).toBe(1);
    expect(indexes.every((index, i) => i === 0 || index - indexes[i - 1] === step)).toBe(true);
  });
});

describe('generateSequence', () => {
  it('splits counts of at least three into groups of three to five', () => {
    for (let targetCount = 3; targetCount <= 30; targetCount++) {
      const sequence = generateSequence(42, targetCount);
      expect(countTargets(sequence)).toBe(targetCount);
      expect(sequence.every((group) => group.length >= 3 && group.length <= 5)).toBe(true);
    }
  });

  it('repeats the same sequence for the same seed', () => {
    const first = generateSequence(123, 24);
    const second = generateSequence(123, 24);
    expect(first).toEqual(second);
  });

  it('handles counts shorter than a full group', () => {
    expect(generateSequence(42, 0)).toEqual([]);
    expect(generateSequence(42, 1).map((group) => group.length)).toEqual([1]);
    expect(generateSequence(42, 2).map((group) => group.length)).toEqual([2]);
  });

  it('rejects invalid target counts', () => {
    for (const targetCount of [-1, 1.5, Infinity, NaN]) {
      expect(() => generateSequence(42, targetCount)).toThrow(RangeError);
    }
  });
});
