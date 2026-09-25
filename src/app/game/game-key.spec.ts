import { GAME_KEYS, toGameKey } from './game-key';

describe('game key layout', () => {
  it('orders the game keys by physical position, left hand first', () => {
    expect(GAME_KEYS).toEqual(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
  });
});

describe('toGameKey', () => {
  it('maps each home-row key code to its game key', () => {
    const codes = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'];
    expect(codes.map(toGameKey)).toEqual(GAME_KEYS);
  });

  it('returns null for other key codes', () => {
    for (const code of ['KeyG', 'Space', 'Backspace', 'Enter']) {
      expect(toGameKey(code)).toBeNull();
    }
  });
});
