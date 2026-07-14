import type { Mission } from "../types";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// 멤버별 성실도 0.55 ~ 0.94 로 고정
export function mockCompletions(
  userId: string,
  missions: Mission[],
  durationDays: number
): Record<string, number[]> {
  const reliability = 0.55 + (hash(userId) % 40) / 100;
  const result: Record<string, number[]> = {};
  for (const m of missions) {
    const rand = mulberry32(hash(userId + ":" + m.id));
    const days: number[] = [];
    for (let d = 1; d <= durationDays; d++) {
      if (rand() < reliability) days.push(d);
    }
    result[m.id] = days;
  }
  return result;
}