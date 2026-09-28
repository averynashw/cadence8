import { GAME_KEYS, LEFT_HAND_KEYS, type GameKey } from './game-key';
import { createSeededRandom } from './seeded-random';
import {
  createAlternatingGroup,
  createDoubleGroup,
  createOneHandTrillGroup,
  createRollGroup,
  createTwoHandTrillGroup,
  generateSequence,
} from './sequence-generator';
import { countTargets } from './target-sequence';

function isLeftHand(key: GameKey): boolean {
  return (LEFT_HAND_KEYS as readonly GameKey[]).includes(key);
}

// counts left to right within each hand (so a and j are 0 and f and ; are 3)
function handIndex(key: GameKey): number {
  return GAME_KEYS.indexOf(key) % 4;
}

describe('createAlternatingGroup', () => {
  it('switches hands on every key', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createAlternatingGroup(random, 5);
      const hands = group.map(isLeftHand);
      expect(hands.every((left, i) => i === 0 || left !== hands[i - 1])).toBe(true);
    }
  });

  it('walks both hands in step as parallel or mirrored pairs', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createAlternatingGroup(random, 5);
      const left = group.filter(isLeftHand).map(handIndex);
      const right = group.filter((key) => !isLeftHand(key)).map(handIndex);
      const pairs = left.slice(0, right.length).map((index, i) => [index, right[i]]);
      const parallel = pairs.every(([l, r]) => r === l);
      const mirrored = pairs.every(([l, r]) => r === 3 - l);
      expect(parallel || mirrored).toBe(true);
      expect(left.every((index, i) => i === 0 || Math.abs(index - left[i - 1]) === 1)).toBe(true);
    }
  });
});

describe('createRollGroup', () => {
  it('rolls across adjacent keys on one hand', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createRollGroup(random, 4);
      const indexes = group.map((key) => GAME_KEYS.indexOf(key));
      const step = indexes[1] - indexes[0];
      expect(Math.abs(step)).toBe(1);
      expect(indexes.every((index, i) => i === 0 || index - indexes[i - 1] === step)).toBe(true);
    }
  });

  it('ends a five-key roll on the same finger of the other hand', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createRollGroup(random, 5);
      expect(isLeftHand(group[4])).not.toBe(isLeftHand(group[3]));
      expect(handIndex(group[4])).toBe(3 - handIndex(group[3]));
    }
  });
});

describe('createTwoHandTrillGroup', () => {
  it('repeats a parallel or mirrored pair across the hands', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createTwoHandTrillGroup(random, 5);
      const [first, second] = group;
      expect(isLeftHand(first)).not.toBe(isLeftHand(second));
      expect([handIndex(first), 3 - handIndex(first)]).toContain(handIndex(second));
      expect(group).toEqual([first, second, first, second, first]);
    }
  });
});

describe('createOneHandTrillGroup', () => {
  it('repeats two keys on one hand', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createOneHandTrillGroup(random, 5);
      const [first, second] = group;
      expect(isLeftHand(first)).toBe(isLeftHand(second));
      expect(first).not.toBe(second);
      expect(group).toEqual([first, second, first, second, first]);
    }
  });
});

describe('createDoubleGroup', () => {
  it('presses each key of a cross-hand pair twice', () => {
    const random = createSeededRandom(1);
    for (let sample = 0; sample < 50; sample++) {
      const group = createDoubleGroup(random, 5);
      const [first, , second] = group;
      expect(isLeftHand(first)).not.toBe(isLeftHand(second));
      expect([handIndex(first), 3 - handIndex(first)]).toContain(handIndex(second));
      expect(group).toEqual([first, first, second, second, first]);
    }
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

  it('keeps long-run key frequency roughly balanced', () => {
    const counts = new Map<GameKey, number>(GAME_KEYS.map((key) => [key, 0]));
    let total = 0;
    for (let seed = 0; seed < 200; seed++) {
      for (const key of generateSequence(seed, 40).flat()) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
        total++;
      }
    }
    // an even share is 12.5%, and three-key rolls favor the middle keys slightly
    for (const count of counts.values()) {
      expect(count / total).toBeGreaterThan(0.1);
      expect(count / total).toBeLessThan(0.15);
    }
  });

  it('rejects invalid target counts', () => {
    for (const targetCount of [-1, 1.5, Infinity, NaN]) {
      expect(() => generateSequence(42, targetCount)).toThrow(RangeError);
    }
  });
});
