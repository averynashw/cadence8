import { Component, signal } from '@angular/core';
import { RunView } from './game/run-view/run-view';
import { createRun } from './game/run-state';
import { generateSequence } from './game/sequence-generator';

export const TARGET_COUNT = 40;

@Component({
  selector: 'app-root',
  imports: [RunView],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly run = signal(createRun(generateSequence(Date.now(), TARGET_COUNT)));
}
