export function computeStreak(
  checkins: Record<number, string>,
  currentDay: number
): number {
  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    if (!checkins[d]) break;
    streak++;
  }
  return streak;
}