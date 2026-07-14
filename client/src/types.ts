// 서버 mock 및 클라이언트가 공유하는 도메인 타입 (DB 없음)

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Mission {
  id: string;
  title: string;
  penaltyPoints: number;
  assignedBy: string; // 미션을 정해준 친구
}

export interface MemberRecord {
  user: User;
  missions: Mission[];
  // completions[missionId] = 완료한 날(1..durationDays) 목록
  completions: Record<string, number[]>;
}

export interface Group {
  id: string;
  name: string;
  durationDays: number;
  distributionRule: DistributionRule;
  members: MemberRecord[]; // mock 친구들 (현재 사용자는 클라이언트에서 합쳐짐)
}

export type DistributionRule = "winner" | "proportional";

// 하루 단위 셀 상태 (진행 그리드에서 사용)
export type DayStatus = "done" | "partial" | "missed" | "today" | "future";
