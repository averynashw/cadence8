import { createSeededRandom } from './seeded-random';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createSeededRandom(123);
    const second = createSeededRandom(123);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('advances on each call, including with seed zero', () => {
    const random = createSeededRandom(0);
    const first = random();
    expect(random()).not.toBe(first);
  });

  it('returns values from zero up to but excluding one', () => {
    const random = createSeededRandom(0);
    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
