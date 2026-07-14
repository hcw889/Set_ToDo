// 서버 호출 단일 창구. 지금은 Express mock을 부르지만,
// 나중에 실제 백엔드로 바꿀 때 이 파일만 수정하면 된다 (확장 지점).

import type { Group, Mission } from "../types";

const BASE = "/api"; // vite dev proxy → http://localhost:4000

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} 실패: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getGroup: () => get<Group>("/group"),
  getMyMissions: () =>
    get<{ durationDays: number; missions: Mission[] }>("/missions"),
};
