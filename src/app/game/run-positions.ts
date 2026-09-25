import type { GameKey } from './game-key';
import type { RunState } from './run-state';

export type PositionState = 'completed' | 'current' | 'upcoming';

export interface PositionView {
  readonly key: GameKey;
  readonly state: PositionState;
  readonly correct: boolean | null;
}

export function describePositions(run: RunState): readonly (readonly PositionView[])[] {
  const entered = run.inputBuffer.length;
  let next = 0;

  return run.sequence.map((group) =>
    group.map((key) => {
      const index = next++;
      if (index < entered) {
        return { key, state: 'completed', correct: run.inputBuffer[index] === key };
      }
      return { key, state: index === entered ? 'current' : 'upcoming', correct: null };
    }),
  );
}
