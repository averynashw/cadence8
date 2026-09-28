// once the current group reaches the third line, earlier lines scroll away
const SCROLL_LINE = 2;

export function countGroupsToHide(groupTops: readonly number[], currentGroup: number): number {
  const lineTops = [...new Set(groupTops)];
  const currentLine = lineTops.indexOf(groupTops[currentGroup]);

  if (currentLine < SCROLL_LINE) {
    return 0;
  }

  // keep the line before the current one so the player can see what they just typed
  const keptTop = lineTops[currentLine - 1];
  return groupTops.filter((top) => top < keptTop).length;
}
