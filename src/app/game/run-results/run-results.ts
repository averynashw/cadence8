import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { RunScore } from '../run-score';

@Component({
  selector: 'app-run-results',
  imports: [DecimalPipe, PercentPipe],
  styleUrl: './run-results.css',
  templateUrl: './run-results.html',
})
export class RunResults {
  readonly score = input.required<RunScore>();
  readonly dotCount = input.required<number>();
  protected readonly time = computed(() => formatTime(this.score().elapsedMs));
}

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
