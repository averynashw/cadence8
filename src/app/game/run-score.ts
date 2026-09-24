import { getRunStatus, type RunState } from './run-state';

export const SCORING_VERSION = 1;

export interface RunScore {
  readonly scoringVersion: number;
  readonly accuracy: number;
  readonly keysPerMinute: number;
  readonly rawKeysPerMinute: number;
  readonly consistency: number;
  readonly elapsedMs: number;
}

const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;

export function scoreRun(run: RunState): RunScore | null {
  const { startedAt, completedAt } = run;
  if (getRunStatus(run) !== 'complete' || startedAt === null || completedAt === null) {
    return null;
  }

  const history = run.forwardInputHistory;
  const targets = run.sequence.flat();
  const correctInputs = history.filter((input) => input.actual === input.expected).length;
  const correctKeys = run.inputBuffer.filter((key, i) => key === targets[i]).length;
  const elapsedMs = completedAt - startedAt;

  return {
    scoringVersion: SCORING_VERSION,
    accuracy: correctInputs / history.length,
    keysPerMinute: perMinute(correctKeys, elapsedMs),
    rawKeysPerMinute: perMinute(history.length, elapsedMs),
    consistency: measureConsistency(
      history.map((input) => input.time - startedAt),
      elapsedMs,
    ),
    elapsedMs,
  };
}

function perMinute(count: number, elapsedMs: number): number {
  // a one-key run starts and ends on the same input, so no time elapses
  return elapsedMs === 0 ? 0 : (count * MS_PER_MINUTE) / elapsedMs;
}

function measureConsistency(offsets: readonly number[], elapsedMs: number): number {
  // a trailing partial second is dropped because its few inputs would distort the rate
  const counts: number[] = Array(Math.floor(elapsedMs / MS_PER_SECOND)).fill(0);
  for (const offset of offsets) {
    const second = Math.floor(offset / MS_PER_SECOND);
    if (second < counts.length) {
      counts[second]++;
    }
  }

  // a run shorter than one full second has no pacing to compare
  if (counts.length === 0) {
    return 1;
  }

  const mean = counts.reduce((total, count) => total + count, 0) / counts.length;
  const variance = counts.reduce((total, count) => total + (count - mean) ** 2, 0) / counts.length;
  const cv = Math.sqrt(variance) / mean;

  // maps a coefficient of variation of 0 to 1 and larger ones toward 0 (curve from monkeytype)
  return 1 - Math.tanh(cv + cv ** 3 / 3 + cv ** 5 / 5);
}
