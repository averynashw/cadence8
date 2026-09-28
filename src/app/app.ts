import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { toGameKey } from './game/game-key';
import { RunResults } from './game/run-results/run-results';
import { RunView } from './game/run-view/run-view';
import { scoreRun } from './game/run-score';
import { backspace, createRun, enterKey, type RunState } from './game/run-state';
import { generateSequence } from './game/sequence-generator';
import { countTargets } from './game/target-sequence';

export const TARGET_COUNT = 25;

function createNewRun(): RunState {
  return createRun(generateSequence(Date.now(), TARGET_COUNT));
}

@Component({
  selector: 'app-root',
  imports: [RunResults, RunView],
  host: { '(document:keydown)': 'handleKeydown($event)' },
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly run = signal(createNewRun());
  protected readonly score = computed(() => scoreRun(this.run()));
  protected readonly dotCount = computed(() => countTargets(this.run().sequence));
  private readonly restartButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('restartButton');

  protected handleKeydown(event: KeyboardEvent): void {
    // leave browser and system shortcuts alone
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    // unlike game keys, a held backspace repeats like ordinary typing
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.releaseRestartFocus();
      this.run.update(backspace);
      return;
    }

    const key = toGameKey(event.code);
    if (key === null) {
      return;
    }

    event.preventDefault();
    this.releaseRestartFocus();

    // ignore auto-repeat so holding a key counts as a single press
    if (!event.repeat) {
      this.run.update((run) => enterKey(run, key, event.timeStamp));
    }
  }

  protected restart(): void {
    this.run.set(createNewRun());
    this.releaseRestartFocus();
  }

  // so a stray enter or space can't restart the run by accident
  private releaseRestartFocus(): void {
    this.restartButton().nativeElement.blur();
  }
}
