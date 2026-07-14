// 벌금·정산(분배) 순수 함수 모음. UI와 무관하게 테스트 가능.
import type {
  DayStatus,
  DistributionRule,
  MemberRecord,
  Mission,
  User,
} from "../types";

// 오늘(currentDay)은 아직 완료 가능하므로 벌금 대상이 아니다.
// "지나간 날" = day < currentDay (durationDays 초과분은 제외).

// 한 멤버가 지금까지 쌓은 벌금 포인트
export function penaltyForMember(
  missions: Mission[],
  completions: Record<string, number[]>,
  currentDay: number,
  durationDays: number
): number {
  let total = 0;
  const lastPast = Math.min(currentDay - 1, durationDays);
  for (let d = 1; d <= lastPast; d++) {
    for (const m of missions) {
      const done = completions[m.id]?.includes(d) ?? false;
      if (!done) total += m.penaltyPoints;
    }
  }
  return total;
}

// 지금까지 완료율 (0~1). 아직 지나간 날이 없으면 1로 취급.
export function completionRate(
  missions: Mission[],
  completions: Record<string, number[]>,
  currentDay: number,
  durationDays: number
): number {
  const lastPast = Math.min(currentDay - 1, durationDays);
  const totalDue = lastPast * missions.length;
  if (totalDue <= 0) return 1;
  let done = 0;
  for (let d = 1; d <= lastPast; d++) {
    for (const m of missions) {
      if (completions[m.id]?.includes(d)) done++;
    }
  }
  return done / totalDue;
}

// 특정 날의 상태 (진행 그리드 셀)
export function dayStatus(
  missions: Mission[],
  completions: Record<string, number[]>,
  day: number,
  currentDay: number,
  durationDays: number
): DayStatus {
  if (day > durationDays || day > currentDay) return "future";
  const total = missions.length;
  const doneCount = missions.filter((m) =>
    completions[m.id]?.includes(day)
  ).length;

  if (day === currentDay) {
    return total > 0 && doneCount === total ? "done" : "today";
  }
  // 지나간 날
  if (doneCount === 0) return "missed";
  if (doneCount === total) return "done";
  return "partial";
}

// ---- 정산 ----

export interface MemberComputed {
  user: User;
  penalty: number;
  completion: number; // 0~1
}

export interface Payout {
  user: User;
  penalty: number; // 낸 벌금
  share: number; // 정산에서 돌려받는 포인트
  net: number; // share - penalty
}

export function computeMembers(
  members: MemberRecord[],
  currentDay: number,
  durationDays: number
): MemberComputed[] {
  return members.map((m) => ({
    user: m.user,
    penalty: penaltyForMember(m.missions, m.completions, currentDay, durationDays),
    completion: completionRate(m.missions, m.completions, currentDay, durationDays),
  }));
}

export function poolTotal(computed: MemberComputed[]): number {
  return computed.reduce((s, m) => s + m.penalty, 0);
}

// 분배 규칙:
//  - winner: 벌금이 가장 적은(가장 잘 지킨) 사람이 전액. 동점이면 균등 분배.
//  - proportional: 잘 지킨 만큼 더 받도록 벌금에 "반비례"해 분배.
//    가중치 w_i = (maxPenalty - penalty_i). 모두 같으면(Σw=0) 균등 분배.
export function settlement(
  computed: MemberComputed[],
  rule: DistributionRule
): Payout[] {
  const pool = poolTotal(computed);
  const n = computed.length;

  if (pool <= 0 || n === 0) {
    return computed.map((m) => ({
      user: m.user,
      penalty: m.penalty,
      share: 0,
      net: -m.penalty,
    }));
  }

  let shares: number[];
  if (rule === "winner") {
    const min = Math.min(...computed.map((m) => m.penalty));
    const winnerIdx = computed
      .map((m, i) => (m.penalty === min ? i : -1))
      .filter((i) => i >= 0);
    const each = pool / winnerIdx.length;
    shares = new Array(n).fill(0);
    winnerIdx.forEach((i) => (shares[i] = each));
  } else {
    const max = Math.max(...computed.map((m) => m.penalty));
    const weights = computed.map((m) => max - m.penalty);
    const wsum = weights.reduce((s, w) => s + w, 0);
    shares =
      wsum <= 0
        ? new Array(n).fill(pool / n)
        : weights.map((w) => (pool * w) / wsum);
  }

  return computed.map((m, i) => {
    const share = Math.round(shares[i]);
    return { user: m.user, penalty: m.penalty, share, net: share - m.penalty };
  });
}

// 포인트 표시 포맷: 12345 → "12,345 P"
export function formatPoints(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${Math.abs(n).toLocaleString("ko-KR")} P`;
}
