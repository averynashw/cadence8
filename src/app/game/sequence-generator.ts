import { GAME_KEYS, LEFT_HAND_KEYS, RIGHT_HAND_KEYS, type GameKey } from './game-key';
import { createSeededRandom } from './seeded-random';
import type { TargetGroup, TargetSequence } from './target-sequence';

export const GENERATOR_VERSION = 1;

type GroupBuilder = (random: () => number, length: number) => TargetGroup;

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

export function createAlternatingGroup(random: () => number, length: number): TargetGroup {
  const startWithLeft = random() < 0.5;
  const group: GameKey[] = [];

  for (let position = 0; position < length; position++) {
    const useLeft = position % 2 === 0 ? startWithLeft : !startWithLeft;
    group.push(pick(random, useLeft ? LEFT_HAND_KEYS : RIGHT_HAND_KEYS));
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

  // a hand has only four keys, so a group of five ends with one random key
  if (length > rollLength) {
    group.push(pick(random, GAME_KEYS));
  }

  return group;
}

export function createRandomGroup(random: () => number, length: number): TargetGroup {
  const group: GameKey[] = [];

  for (let position = 0; position < length; position++) {
    group.push(pick(random, GAME_KEYS));
  }

  return group;
}

function chooseGroupLength(random: () => number, remaining: number): number {
  if (remaining <= 5) {
    return remaining;
  }

  const validLengths = [3, 4, 5].filter((length) => remaining - length >= 3);
  return pick(random, validLengths);
}

// initial weights keep random groups occasional
function choosePattern(random: () => number): GroupBuilder {
  const draw = random();

  if (draw < 0.1) {
    return createRandomGroup;
  }

  return draw < 0.55 ? createAlternatingGroup : createRollGroup;
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
