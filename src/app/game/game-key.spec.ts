import { LEFT_HAND_KEYS, RIGHT_HAND_KEYS, GAME_KEYS } from './game-key';

describe('game key layout', () => {
  it('orders the left-hand keys by physical position', () => {
    expect(LEFT_HAND_KEYS).toEqual(['a', 's', 'd', 'f']);
  });

  it('orders the right-hand keys by physical position', () => {
    expect(RIGHT_HAND_KEYS).toEqual(['j', 'k', 'l', ';']);
  });

  it('orders the game keys by physical position', () => {
    expect(GAME_KEYS).toEqual(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
  });
});
