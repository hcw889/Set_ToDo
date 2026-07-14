import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { createLocalUser } from "../lib/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Group, MemberRecord, Mission, User } from "../types";

const DEFAULT_DURATION = 30;
const genId = () => "m-" + Math.random().toString(36).slice(2, 9);

interface DemoContextValue {
  // 로딩/서버 상태
  loading: boolean;
  error: string | null;
  group: Group | null;
  durationDays: number;

  // 현재 사용자 (localStorage)
  currentUser: User | null;
  currentDay: number;
  myMissions: Mission[]; // 서버 기본 미션 + 내가 추가한 미션(병합)
  extraMissions: Mission[]; // 홈/투두 페이지에서 직접 추가한 미션 (삭제 가능)
  myCompletions: Record<string, number[]>;

  // 파생: 나 + 친구들
  meRecord: MemberRecord | null;
  allMembers: MemberRecord[]; // 나 먼저, 그다음 친구들

  // 액션
  login: (name: string) => void;
  logout: () => void;
  addMission: (input: { title: string; penaltyPoints: number }) => void;
  removeMission: (id: string) => void;
  isDone: (missionId: string, day: number) => boolean;
  setDone: (missionId: string, day: number, done: boolean) => void;
  advanceDay: () => void;
  seedSample: () => void;
  jumpToEnd: () => void;
  resetProgress: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>(
    "settodo:user",
    null
  );
  const [currentDay, setCurrentDay] = useLocalStorage<number>("settodo:day", 1);
  const [myCompletions, setMyCompletions] = useLocalStorage<
    Record<string, number[]>
  >("settodo:completions", {});

  const [group, setGroup] = useState<Group | null>(null);
  const [serverMissions, setServerMissions] = useState<Mission[]>([]);
  const [extraMissions, setExtraMissions] = useLocalStorage<Mission[]>(
    "settodo:extramissions",
    []
  );
  const [durationDays, setDurationDays] = useState<number>(DEFAULT_DURATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 서버 mock 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [g, m] = await Promise.all([
          api.getGroup(),
          api.getMyMissions(),
        ]);
        if (!alive) return;
        setGroup(g);
        setServerMissions(m.missions);
        setDurationDays(g.durationDays || m.durationDays || DEFAULT_DURATION);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "데이터 로드 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(
    (name: string) => setCurrentUser(createLocalUser(name)),
    [setCurrentUser]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentDay(1);
    setMyCompletions({});
  }, [setCurrentUser, setCurrentDay, setMyCompletions]);

  // 홈의 "오늘의 미션" = 서버 기본 미션 + 내가 추가한 미션 (병합)
  const myMissions = useMemo<Mission[]>(
    () => [...serverMissions, ...extraMissions],
    [serverMissions, extraMissions]
  );

  // 투두(미션) 추가 → 홈 오늘의 미션에 즉시 반영
  const addMission = useCallback(
    (input: { title: string; penaltyPoints: number }) => {
      const title = input.title.trim();
      if (!title) return;
      const mission: Mission = {
        id: genId(),
        title,
        penaltyPoints: Math.max(0, Math.round(input.penaltyPoints) || 0),
        assignedBy: currentUser?.name ?? "나",
      };
      setExtraMissions((prev) => [...prev, mission]);
    },
    [currentUser, setExtraMissions]
  );

  // 내가 추가한 미션 삭제 (완료 기록도 함께 정리)
  const removeMission = useCallback(
    (id: string) => {
      setExtraMissions((prev) => prev.filter((m) => m.id !== id));
      setMyCompletions((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setExtraMissions, setMyCompletions]
  );

  const isDone = useCallback(
    (missionId: string, day: number) =>
      myCompletions[missionId]?.includes(day) ?? false,
    [myCompletions]
  );

  const setDone = useCallback(
    (missionId: string, day: number, done: boolean) => {
      setMyCompletions((prev) => {
        const days = new Set(prev[missionId] ?? []);
        if (done) days.add(day);
        else days.delete(day);
        return { ...prev, [missionId]: [...days].sort((a, b) => a - b) };
      });
    },
    [setMyCompletions]
  );

  const advanceDay = useCallback(() => {
    setCurrentDay((d) => Math.min(d + 1, durationDays + 1));
  }, [setCurrentDay, durationDays]);

  // 데모 편의: 과거 기록을 살짝 미완료 섞어 채우고 13일차로 점프
  const seedSample = useCallback(() => {
    const upto = 12;
    const next: Record<string, number[]> = {};
    myMissions.forEach((m, i) => {
      const days: number[] = [];
      for (let d = 1; d <= upto; d++) {
        const skip = (d + i * 3) % 6 === 0; // 몇 칸은 일부러 빼서 벌금 생기게
        if (!skip) days.push(d);
      }
      next[m.id] = days;
    });
    setMyCompletions(next);
    setCurrentDay(upto + 1);
  }, [myMissions, setMyCompletions, setCurrentDay]);

  // 데모 편의: 30일 종료 시점으로 점프 (남은 과거 미완료가 모두 벌금 확정)
  const jumpToEnd = useCallback(() => {
    setCurrentDay(durationDays + 1);
  }, [setCurrentDay, durationDays]);

  const resetProgress = useCallback(() => {
    setCurrentDay(1);
    setMyCompletions({});
  }, [setCurrentDay, setMyCompletions]);

  const meRecord = useMemo<MemberRecord | null>(() => {
    if (!currentUser) return null;
    return {
      user: currentUser,
      missions: myMissions,
      completions: myCompletions,
    };
  }, [currentUser, myMissions, myCompletions]);

  const allMembers = useMemo<MemberRecord[]>(() => {
    const friends = group?.members ?? [];
    return meRecord ? [meRecord, ...friends] : friends;
  }, [meRecord, group]);

  const value: DemoContextValue = {
    loading,
    error,
    group,
    durationDays,
    currentUser,
    currentDay,
    myMissions,
    extraMissions,
    myCompletions,
    meRecord,
    allMembers,
    login,
    logout,
    addMission,
    removeMission,
    isDone,
    setDone,
    advanceDay,
    seedSample,
    jumpToEnd,
    resetProgress,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
