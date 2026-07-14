// 목업 데이터 생성 (DB 없음). 결정론적 시드로 매번 동일한 데모 데이터를 만든다.
// 실제 백엔드/DB로 교체할 때 이 파일만 갈아끼우면 된다 (확장 지점).

export const DURATION_DAYS = 30;

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Mission {
  id: string;
  title: string;
  penaltyPoints: number;
  assignedBy: string; // 미션을 정해준 친구 이름
}

export interface MemberRecord {
  user: User;
  missions: Mission[];
  // completions[missionId] = 완료한 날(1..30) 목록
  completions: Record<string, number[]>;
}

export interface Group {
  id: string;
  name: string;
  durationDays: number;
  distributionRule: "winner" | "proportional";
  members: MemberRecord[]; // mock 친구들 (현재 사용자는 클라이언트에서 합쳐짐)
}

// 작고 결정론적인 PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// reliability(0~1) 만큼의 확률로 각 날의 미션을 완료 처리
function genCompletions(
  missions: Mission[],
  reliability: number,
  seed: number
): Record<string, number[]> {
  const rand = mulberry32(seed);
  const result: Record<string, number[]> = {};
  for (const m of missions) {
    const days: number[] = [];
    for (let d = 1; d <= DURATION_DAYS; d++) {
      if (rand() < reliability) days.push(d);
    }
    result[m.id] = days;
  }
  return result;
}

function makeFriend(
  id: string,
  name: string,
  color: string,
  missions: Mission[],
  reliability: number,
  seed: number
): MemberRecord {
  return {
    user: { id, name, avatarColor: color },
    missions,
    completions: genCompletions(missions, reliability, seed),
  };
}

// 그룹 공통 미션 풀 (친구가 서로에게 정해준 미션 컨셉)
const missionSet = (assignedBy: string): Mission[] => [
  { id: "water", title: "물 2L 마시기", penaltyPoints: 500, assignedBy },
  { id: "workout", title: "운동 10분", penaltyPoints: 1000, assignedBy },
  { id: "read", title: "책 5쪽 읽기", penaltyPoints: 700, assignedBy },
];

export const group: Group = {
  id: "grp-1",
  name: "작심삼십일 스터디 모임",
  durationDays: DURATION_DAYS,
  distributionRule: "proportional",
  members: [
    makeFriend("u-jimin", "지민", "#f97316", missionSet("나"), 0.9, 101),
    makeFriend("u-hyun", "현우", "#0ea5e9", missionSet("나"), 0.72, 202),
    makeFriend("u-sora", "소라", "#ec4899", missionSet("나"), 0.55, 303),
  ],
};

// 현재 사용자(로그인 대체: 클라이언트에서 이름만 받음)에게 배정된 미션
export const myMissions: Mission[] = missionSet("지민");
