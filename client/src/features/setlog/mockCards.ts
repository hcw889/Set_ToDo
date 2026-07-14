// 목업 친구들의 셋로그 인증 카드 (피드에서 사용자가 인증/반려 대상). 외부 이미지 없이 그라디언트+이모지로 표현.
import type { User } from "../../types";
import type { VerificationCard } from "./types";

interface Template {
  caption: string;
  time: string;
  emoji: string;
  bg: string; // tailwind gradient classes
}

const TEMPLATES: Template[] = [
  { caption: "점심 머거요", time: "12:14", emoji: "🍗", bg: "from-orange-400 to-rose-500" },
  { caption: "출근...", time: "08:31", emoji: "🌆", bg: "from-slate-500 to-slate-700" },
  { caption: "씻어야하는데 누워있어요", time: "23:47", emoji: "🛏️", bg: "from-indigo-400 to-violet-600" },
  { caption: "오늘도 운동 완료 💪", time: "07:05", emoji: "🏃", bg: "from-emerald-400 to-teal-600" },
  { caption: "쉬자", time: "21:20", emoji: "🍜", bg: "from-amber-400 to-orange-600" },
];

// 친구 목록으로 목업 카드 생성. 초기엔 1명이 승인해둔 pending 상태 → 사용자가 인증/반려 추가.
export function buildMockCards(friends: User[]): VerificationCard[] {
  const n = friends.length;
  return friends.map((friend, i) => {
    const t = TEMPLATES[i % TEMPLATES.length];
    const preApprover = n > 1 ? [friends[(i + 1) % n].id] : [];
    return {
      id: `mock-${friend.id}`,
      author: friend,
      isMine: false,
      caption: t.caption,
      time: t.time,
      emoji: t.emoji,
      bg: t.bg,
      requiredApprovals: 3,
      approvedBy: preApprover,
      rejectedBy: [],
      status: "pending" as const,
    };
  });
}
