import { countGroupsToHide } from './stream-lines';

describe('countGroupsToHide', () => {
  // three groups per line, with lines 50 pixels apart
  const tops = [0, 0, 0, 50, 50, 50, 100, 100, 100, 150, 150];

  it('hides nothing while the current group is on the first two lines', () => {
    expect(countGroupsToHide(tops, 0)).toBe(0);
    expect(countGroupsToHide(tops, 5)).toBe(0);
  });

  it('hides the first line once the current group reaches the third', () => {
    expect(countGroupsToHide(tops, 6)).toBe(3);
  });

  it('hides several lines at once when the current group is further down', () => {
    expect(countGroupsToHide(tops, 9)).toBe(6);
  });
});
