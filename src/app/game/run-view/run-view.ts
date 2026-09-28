import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { LEFT_HAND_KEYS, RIGHT_HAND_KEYS } from '../game-key';
import { describePositions } from '../run-positions';
import { countCompletedGroups, getRunStatus, type RunState } from '../run-state';
import { countGroupsToHide } from '../stream-lines';

@Component({
  selector: 'app-run-view',
  host: { '(window:resize)': 'handleResize()' },
  styleUrl: './run-view.css',
  templateUrl: './run-view.html',
})
export class RunView {
  readonly run = input.required<RunState>();
  protected readonly hands = [LEFT_HAND_KEYS, RIGHT_HAND_KEYS];
  protected readonly positions = computed(() => describePositions(this.run()));
  protected readonly started = computed(() => getRunStatus(this.run()) !== 'ready');
  protected readonly completedGroups = computed(() => countCompletedGroups(this.run()));
  protected readonly visibleGroups = computed(() => this.positions().slice(this.hiddenGroups()));
  private readonly hiddenGroups = signal(0);
  private readonly currentGroup = computed(() =>
    this.positions().findIndex((group) => group.some((position) => position.state === 'current')),
  );
  private readonly resizeCount = signal(0);
  private readonly stream = viewChild.required<ElementRef<HTMLElement>>('stream');

  constructor() {
    // line breaks depend on the rendered width, so they're measured after each render
    afterRenderEffect(() => this.scrollLines());
  }

  protected handleResize(): void {
    this.hiddenGroups.set(0);
    this.resizeCount.update((count) => count + 1);
  }

  private scrollLines(): void {
    // reading the count makes this run again on every resize, even when no lines are hidden
    this.resizeCount();
    const current = this.currentGroup();
    const hidden = this.hiddenGroups();

    // after a restart, or a backspace into a hidden line, show every line and measure again
    if (current < hidden) {
      this.hiddenGroups.set(0);
      return;
    }

    const groups = Array.from(this.stream().nativeElement.children) as HTMLElement[];
    const tops = groups.map((group) => group.offsetTop);
    const toHide = countGroupsToHide(tops, current - hidden);
    if (toHide > 0) {
      this.hiddenGroups.set(hidden + toHide);
    }
  }
}
