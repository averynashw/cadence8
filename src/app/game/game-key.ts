export const LEFT_HAND_KEYS = ['a', 's', 'd', 'f'] as const;
export const RIGHT_HAND_KEYS = ['j', 'k', 'l', ';'] as const;
export const GAME_KEYS = [...LEFT_HAND_KEYS, ...RIGHT_HAND_KEYS] as const;

export type GameKey = (typeof GAME_KEYS)[number];
