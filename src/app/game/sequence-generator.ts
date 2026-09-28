import { GAME_KEYS, LEFT_HAND_KEYS, RIGHT_HAND_KEYS, type GameKey } from './game-key';
import { createSeededRandom } from './seeded-random';
import type { TargetGroup, TargetSequence } from './target-sequence';

export const GENERATOR_VERSION = 2;

type GroupBuilder = (random: () => number, length: number) => TargetGroup;

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

// the same finger on the other hand, so f pairs with j and a with ;
function mirrorKey(key: GameKey): GameKey {
  return GAME_KEYS[GAME_KEYS.length - 1 - GAME_KEYS.indexOf(key)];
}

// a parallel key sits in the same spot on the other hand, so a pairs with j
function matchingRightKey(left: GameKey, mirrored: boolean): GameKey {
  return mirrored ? mirrorKey(left) : GAME_KEYS[GAME_KEYS.indexOf(left) + LEFT_HAND_KEYS.length];
}

function chooseCrossHandPair(random: () => number): GameKey[] {
  const left = pick(random, LEFT_HAND_KEYS);
  const mirrored = random() < 0.5;
  const right = matchingRightKey(left, mirrored);
  return random() < 0.5 ? [left, right] : [right, left];
}

function repeatPattern(pattern: readonly GameKey[], length: number): GameKey[] {
  return Array.from({ length }, (_, position) => pattern[position % pattern.length]);
}

export function createAlternatingGroup(random: () => number, length: number): TargetGroup {
  const mirrored = random() < 0.5;
  const startWithLeft = random() < 0.5;
  const reverse = random() < 0.5;
  // staying in one half of each hand keeps every key equally likely
  const halfStart = random() < 0.5 ? 0 : 2;
  const group: GameKey[] = [];

  for (let position = 0; position < length; position++) {
    // every two keys move one step, and a fifth key returns to the start
    const step = Math.floor(position / 2) % 2;
    const left = LEFT_HAND_KEYS[halfStart + (reverse ? 1 - step : step)];
    const useLeft = position % 2 === 0 ? startWithLeft : !startWithLeft;
    group.push(useLeft ? left : matchingRightKey(left, mirrored));
  }

  return group;
}

export function createRollGroup(random: () => number, length: number): TargetGroup {
  const handKeys = random() < 0.5 ? LEFT_HAND_KEYS : RIGHT_HAND_KEYS;
  const rollLength = Math.min(length, handKeys.length);
  const reverse = random() < 0.5;
  const startOffset = Math.floor(random() * (handKeys.length - rollLength + 1));
  const group: GameKey[] = [];

  for (let position = 0; position < rollLength; position++) {
    const index = reverse
      ? handKeys.length - 1 - startOffset - position
      : startOffset + position;
    group.push(handKeys[index]);
  }

  // a hand has only four keys, so a fifth key crosses to the same finger on the other hand
  if (length > rollLength) {
    group.push(mirrorKey(group[group.length - 1]));
  }

  return group;
}

export function createTwoHandTrillGroup(random: () => number, length: number): TargetGroup {
  return repeatPattern(chooseCrossHandPair(random), length);
}

export function createOneHandTrillGroup(random: () => number, length: number): TargetGroup {
  const handKeys = random() < 0.5 ? LEFT_HAND_KEYS : RIGHT_HAND_KEYS;
  // every key appears in exactly two of these pairs, so no finger is favored
  const [firstIndex, secondIndex] = pick(random, [[0, 1], [2, 3], [0, 2], [1, 3]]);
  const [first, second] = [handKeys[firstIndex], handKeys[secondIndex]];
  return repeatPattern(random() < 0.5 ? [first, second] : [second, first], length);
}

export function createDoubleGroup(random: () => number, length: number): TargetGroup {
  const [first, second] = chooseCrossHandPair(random);
  return repeatPattern([first, first, second, second], length);
}

function chooseGroupLength(random: () => number, remaining: number): number {
  if (remaining <= 5) {
    return remaining;
  }

  const validLengths = [3, 4, 5].filter((length) => remaining - length >= 3);
  return pick(random, validLengths);
}

// starting weights in percent to be tuned through playtesting
const PATTERN_WEIGHTS: readonly (readonly [GroupBuilder, number])[] = [
  [createAlternatingGroup, 30],
  [createRollGroup, 30],
  [createTwoHandTrillGroup, 15],
  [createOneHandTrillGroup, 15],
  [createDoubleGroup, 10],
];

function choosePattern(random: () => number): GroupBuilder {
  let draw = random() * 100;

  for (const [builder, weight] of PATTERN_WEIGHTS) {
    draw -= weight;
    if (draw < 0) {
      return builder;
    }
  }

  throw new Error('pattern weights must add up to 100');
}

export function generateSequence(seed: number, targetCount: number): TargetSequence {
  if (!Number.isSafeInteger(targetCount) || targetCount < 0) {
    throw new RangeError('targetCount must be a non-negative safe integer');
  }

  const random = createSeededRandom(seed);
  const sequence: TargetGroup[] = [];

  let remaining = targetCount;

  while (remaining > 0) {
    const groupLength = chooseGroupLength(random, remaining);
    const group = choosePattern(random)(random, groupLength);
    sequence.push(group);
    remaining -= group.length;
  }

  return sequence;
}
