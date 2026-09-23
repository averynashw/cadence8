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
  readonly startedAt: number | null;
  readonly completedAt: number | null;
}

export type RunStatus = 'ready' | 'active' | 'complete';

export function createRun(sequence: TargetSequence): RunState {
  return {
    sequence,
    inputBuffer: [],
    forwardInputHistory: [],
    startedAt: null,
    completedAt: null,
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

export function enterKey(run: RunState, key: GameKey, now: number): RunState {
  if (getRunStatus(run) === 'complete') {
    return run;
  }

  const expected = run.sequence.flat()[run.inputBuffer.length];
  const inputBuffer = [...run.inputBuffer, key];
  const isComplete = inputBuffer.length === countTargets(run.sequence);

  return {
    ...run,
    inputBuffer,
    forwardInputHistory: [...run.forwardInputHistory, { expected, actual: key }],
    startedAt: run.startedAt ?? now,
    completedAt: isComplete ? now : null,
  };
}

export function backspace(run: RunState): RunState {
  if (run.inputBuffer.length === 0 || getRunStatus(run) === 'complete') {
    return run;
  }

  return {
    ...run,
    inputBuffer: run.inputBuffer.slice(0, -1),
  };
}
