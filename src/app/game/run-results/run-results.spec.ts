import { TestBed } from '@angular/core/testing';
import { RunResults } from './run-results';

describe('RunResults', () => {
  it('formats each result for display', async () => {
    const fixture = TestBed.createComponent(RunResults);
    fixture.componentRef.setInput('score', {
      scoringVersion: 1,
      accuracy: 0.956,
      keysPerMinute: 123.4,
      rawKeysPerMinute: 130.6,
      consistency: 0.781,
      elapsedMs: 72_345,
    });
    fixture.componentRef.setInput('dotCount', 40);
    await fixture.whenStable();
    const values = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('dd'),
      (dd) => dd.textContent?.trim(),
    );
    expect(values).toEqual(['123', '96%', '40 dots', '131', '78%', '01:12']);
  });
});
