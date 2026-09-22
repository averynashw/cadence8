import type { GameKey } from './game-key';

export type TargetGroup = readonly GameKey[];
export type TargetSequence = readonly TargetGroup[];

export function countTargets(sequence: TargetSequence): number {
  return sequence.reduce((total, group) => total + group.length, 0);
}
