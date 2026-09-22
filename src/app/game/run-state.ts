import type { GameKey } from './game-key';
import { countTargets, type TargetSequence } from './target-sequence';

export interface ForwardInput {
  readonly expected: GameKey;
  readonly actual: GameKey;
}

export interface RunState {
  readonly sequence: TargetSequence;
  readonly inputBuffer: readonly GameKey[];
  readonly forwardInputHistory: readonly ForwardInput[];
}

export type RunStatus = 'ready' | 'active' | 'complete';

export function createRun(sequence: TargetSequence): RunState {
  return {
    sequence,
    inputBuffer: [],
    forwardInputHistory: [],
  };
}

export function getRunStatus(run: RunState): RunStatus {
  if (run.forwardInputHistory.length === 0) {
    return 'ready';
  }

  if (run.inputBuffer.length === countTargets(run.sequence)) {
    return 'complete';
  }

  return 'active';
}
