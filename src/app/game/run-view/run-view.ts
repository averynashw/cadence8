import { Component, computed, input } from '@angular/core';
import { LEFT_HAND_KEYS, RIGHT_HAND_KEYS } from '../game-key';
import { describePositions } from '../run-positions';
import { countCompletedGroups, getRunStatus, type RunState } from '../run-state';

@Component({
  selector: 'app-run-view',
  styleUrl: './run-view.css',
  templateUrl: './run-view.html',
})
export class RunView {
  readonly run = input.required<RunState>();
  protected readonly hands = [LEFT_HAND_KEYS, RIGHT_HAND_KEYS];
  protected readonly positions = computed(() => describePositions(this.run()));
  protected readonly started = computed(() => getRunStatus(this.run()) !== 'ready');
  protected readonly completedGroups = computed(() => countCompletedGroups(this.run()));
}
