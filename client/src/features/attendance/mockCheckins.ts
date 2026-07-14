import type { User } from "../../types";

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

const pad = (n: number) => String(n).padStart(2, "0");

export function friendCheckinTime(user: User, day: number): string | null {
  const r = mulberry32(hash(`${user.id}:${day}`))();
  if (r > 0.82) return null;
  const hour = 6 + Math.floor(r * 10); // 06~14시
  const minute = Math.floor(r * 3600) % 60;
  return `${pad(hour)}:${pad(minute)}`;
}