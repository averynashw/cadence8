import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { App, TARGET_COUNT } from './app';
import { GAME_KEYS } from './game/game-key';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  function streamDots(): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>('.stream .dot'));
  }

  function currentKey(): string {
    return element.querySelector('.stream .current')?.getAttribute('data-key') ?? '';
  }

  function codeFor(key: string): string {
    return key === ';' ? 'Semicolon' : `Key${key.toUpperCase()}`;
  }

  async function press(init: KeyboardEventInit): Promise<KeyboardEvent> {
    const event = new KeyboardEvent('keydown', { cancelable: true, ...init });
    document.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  }

  it('renders a generated run with its first dot current', () => {
    expect(element.querySelectorAll('.key-row .dot')).toHaveLength(GAME_KEYS.length);
    expect(streamDots()).toHaveLength(TARGET_COUNT);
    expect(element.querySelectorAll('.stream .current')).toHaveLength(1);
    expect(streamDots()[0].classList).toContain('current');
  });

  it('advances on a correct key and blocks its default action', async () => {
    const event = await press({ code: codeFor(currentKey()) });
    expect(event.defaultPrevented).toBe(true);
    expect(streamDots()[0].classList).toContain('completed');
    expect(streamDots()[0].classList).not.toContain('wrong');
    expect(streamDots()[1].classList).toContain('current');
  });

  it('marks a wrong key and backspaces over it', async () => {
    const wrongKey = GAME_KEYS.find((key) => key !== currentKey()) ?? 'a';
    await press({ code: codeFor(wrongKey) });
    expect(streamDots()[0].classList).toContain('wrong');
    await press({ key: 'Backspace', code: 'Backspace' });
    expect(streamDots()[0].classList).toContain('current');
  });

  it('ignores repeated keys and keys held with a modifier', async () => {
    const code = codeFor(currentKey());
    await press({ code, repeat: true });
    const shortcut = await press({ code, ctrlKey: true });
    expect(shortcut.defaultPrevented).toBe(false);
    expect(streamDots()[0].classList).toContain('current');
  });

  it('lets a held backspace repeat', async () => {
    await press({ code: codeFor(currentKey()) });
    await press({ code: codeFor(currentKey()) });
    await press({ key: 'Backspace', code: 'Backspace' });
    await press({ key: 'Backspace', code: 'Backspace', repeat: true });
    expect(streamDots()[0].classList).toContain('current');
  });

  it('leaves other keys alone', async () => {
    const event = await press({ key: 'Tab', code: 'Tab' });
    expect(event.defaultPrevented).toBe(false);
    expect(streamDots()[0].classList).toContain('current');
  });

  it('restarts with a fresh run and moves focus off restart', async () => {
    const restartButton = element.querySelector('button') as HTMLButtonElement;
    await press({ code: codeFor(currentKey()) });
    restartButton.focus();
    expect(document.activeElement).toBe(restartButton);
    restartButton.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('.stream .completed')).toHaveLength(0);
    expect(streamDots()[0].classList).toContain('current');
    expect(document.activeElement).not.toBe(restartButton);
  });

  it('moves focus off restart when the player types', async () => {
    const restartButton = element.querySelector('button') as HTMLButtonElement;
    const gameKey = { code: codeFor(currentKey()) };
    const backspaceKey = { key: 'Backspace', code: 'Backspace' };
    for (const init of [gameKey, backspaceKey]) {
      restartButton.focus();
      expect(document.activeElement).toBe(restartButton);
      await press(init);
      expect(document.activeElement).not.toBe(restartButton);
    }
  });
});
