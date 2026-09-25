import { TestBed } from '@angular/core/testing';
import { App, TARGET_COUNT } from './app';
import { GAME_KEYS } from './game/game-key';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('renders a generated run with its first dot current', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const streamDots = element.querySelectorAll('.stream .dot');
    expect(element.querySelectorAll('.key-row .dot')).toHaveLength(GAME_KEYS.length);
    expect(streamDots).toHaveLength(TARGET_COUNT);
    expect(element.querySelectorAll('.stream .current')).toHaveLength(1);
    expect(streamDots[0].classList).toContain('current');
  });
});
