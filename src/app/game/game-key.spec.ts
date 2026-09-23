import { GAME_KEYS } from './game-key';

describe('game key layout', () => {
  it('orders the game keys by physical position, left hand first', () => {
    expect(GAME_KEYS).toEqual(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
  });
});
