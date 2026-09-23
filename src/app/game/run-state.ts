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

  // an error in the final group leaves the run open so it ends on a clean group
  if (isBufferFull(run) && isFinalGroupCorrect(run)) {
    return 'complete';
  }

  return 'active';
}

export function enterKey(run: RunState, key: GameKey, now: number): RunState {
  if (isBufferFull(run)) {
    return run;
  }

  const expected = run.sequence.flat()[run.inputBuffer.length];
  const nextRun: RunState = {
    ...run,
    inputBuffer: [...run.inputBuffer, key],
    forwardInputHistory: [...run.forwardInputHistory, { expected, actual: key }],
    startedAt: run.startedAt ?? now,
  };

  return getRunStatus(nextRun) === 'complete' ? { ...nextRun, completedAt: now } : nextRun;
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

function isBufferFull(run: RunState): boolean {
  return run.inputBuffer.length === countTargets(run.sequence);
}

function isFinalGroupCorrect(run: RunState): boolean {
  const finalGroup = run.sequence.at(-1) ?? [];
  const finalInput = run.inputBuffer.slice(-finalGroup.length);
  return finalGroup.every((key, i) => key === finalInput[i]);
}
