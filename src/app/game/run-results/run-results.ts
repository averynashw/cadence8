import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, input } from '@angular/core';
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
}
