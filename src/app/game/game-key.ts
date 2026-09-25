export const LEFT_HAND_KEYS = ['a', 's', 'd', 'f'] as const;
export const RIGHT_HAND_KEYS = ['j', 'k', 'l', ';'] as const;
export const GAME_KEYS = [...LEFT_HAND_KEYS, ...RIGHT_HAND_KEYS] as const;

export type GameKey = (typeof GAME_KEYS)[number];

// physical key codes keep the home-row positions on any keyboard layout
const GAME_KEY_CODES = new Map<string, GameKey>([
  ['KeyA', 'a'],
  ['KeyS', 's'],
  ['KeyD', 'd'],
  ['KeyF', 'f'],
  ['KeyJ', 'j'],
  ['KeyK', 'k'],
  ['KeyL', 'l'],
  ['Semicolon', ';'],
]);

export function toGameKey(code: string): GameKey | null {
  return GAME_KEY_CODES.get(code) ?? null;
}
