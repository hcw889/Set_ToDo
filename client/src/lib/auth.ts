// 로그인은 이번 데모에서 구현하지 않는다 (확장 지점만 남김).
// 현재 사용자는 온보딩에서 받은 이름으로 localStorage에 저장된다.
// 나중에 실제 인증(카카오/이메일 등)을 붙일 때 이 파일을 실제 세션 조회로 교체.

import type { User } from "../types";

const PALETTE = [
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#7c3aed",
  "#db2777",
];

// 이름을 안정적인 색으로 매핑 (아바타 색)
export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

// 온보딩에서 이름을 받아 현재 사용자를 만든다 (실인증 대체)
export function createLocalUser(name: string): User {
  const trimmed = name.trim();
  return {
    id: "me",
    name: trimmed,
    avatarColor: colorForName(trimmed || "나"),
  };
}
