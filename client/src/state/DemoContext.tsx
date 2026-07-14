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
import {
  useGroups,
  groupToMemberRecords,
  type GroupStore,
  type LocalGroup,
} from "../lib/groupStore";
import { mockCompletions } from "../lib/mockProgress";
import type { Group, MemberRecord, Mission, User } from "../types";

const DEFAULT_DURATION = 30;
const genId = () => "m-" + Math.random().toString(36).slice(2, 9);

type CheckinMap = Record<number, string>; // day → "HH:MM"
type CompletionMap = Record<string, number[]>; // missionId → 완료한 날 목록

function nowHHMM(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return hh + ":" + mm;
}

interface DemoContextValue {
  // 로딩/서버 상태
  loading: boolean;
  error: string | null;
  group: Group | null; // 서버 mock (기본 미션·기간용으로만 사용)
  durationDays: number;

  // 모임(로컬) — 홈/모임/정산이 공유하는 단일 소스
  groupStore: GroupStore;
  localGroups: LocalGroup[];
  selectedGroup: LocalGroup | null;
  selectGroup: (id: string | null) => void;
  groupName: string;
  groupMembers: User[]; // 모임 전원 (나 포함)
  friends: User[]; // 나 제외
  meMemberId: string | null;

  // 현재 사용자 (localStorage)
  currentUser: User | null;
  currentDay: number;
  myMissions: Mission[];
  extraMissions: Mission[];
  myCompletions: CompletionMap;

  // 출석(체크인)
  myCheckins: CheckinMap;
  checkedInToday: boolean;
  checkIn: () => void;
  resetTodayCheckin: () => void;

  // 파생
  meRecord: MemberRecord | null;
  allMembers: MemberRecord[];

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
  const [currentUser, setCurrentUser] = useLocalStorage(
    "settodo:user",
    null as User | null
  );
  const [currentDay, setCurrentDay] = useLocalStorage("settodo:day", 1);
  const [myCompletions, setMyCompletions] = useLocalStorage(
    "settodo:completions",
    {} as CompletionMap
  );
  const [myCheckins, setMyCheckins] = useLocalStorage(
    "settodo:checkins",
    {} as CheckinMap
  );
  const [extraMissions, setExtraMissions] = useLocalStorage(
    "settodo:extramissions",
    [] as Mission[]
  );
  const [selectedGroupId, setSelectedGroupId] = useLocalStorage(
    "settodo:selectedgroup",
    ""
  );

  const [group, setGroup] = useState<Group | null>(null);
  const [serverMissions, setServerMissions] = useState<Mission[]>([]);
  const [durationDays, setDurationDays] = useState<number>(DEFAULT_DURATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- 모임(로컬): 여기서만 useGroups()를 호출한다.
  // Group 페이지가 따로 호출하면 훅 인스턴스가 갈라져 동기화가 깨진다.
  const groupStore = useGroups();
  const localGroups = groupStore.groups;

  const selectedGroup =
    localGroups.find((g) => g.id === selectedGroupId) ?? localGroups[0] ?? null;

  const selectGroup = useCallback(
    (id: string | null) => setSelectedGroupId(id ?? ""),
    [setSelectedGroupId]
  );

  // 모임의 "나" 멤버: 현재 사용자 이름과 같거나, 시드에서 만든 "나"
  const meMember = useMemo(() => {
    const ms = selectedGroup?.members ?? [];
    return (
      ms.find((m) => m.name === currentUser?.name) ??
      ms.find((m) => m.name === "나") ??
      null
    );
  }, [selectedGroup, currentUser]);

  const meMemberId = meMember?.id ?? null;

  // 모임 전원을 User로 변환 (나는 온보딩 이름/색으로 치환 → 홈과 표기 일치)
  const groupMembers = useMemo<User[]>(
    () =>
      (selectedGroup?.members ?? []).map((m) =>
        m.id === meMemberId && currentUser
          ? { id: m.id, name: currentUser.name, avatarColor: currentUser.avatarColor }
          : { id: m.id, name: m.name, avatarColor: m.color }
      ),
    [selectedGroup, meMemberId, currentUser]
  );

  const friends = useMemo<User[]>(
    () => groupMembers.filter((u) => u.id !== meMemberId),
    [groupMembers, meMemberId]
  );

  // 서버 mock 로드 (기본 미션 + 기간)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [g, m] = await Promise.all([api.getGroup(), api.getMyMissions()]);
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
    setMyCheckins({});
  }, [setCurrentUser, setCurrentDay, setMyCompletions, setMyCheckins]);

  // ---- 출석(체크인) ----
  const checkedInToday = !!myCheckins[currentDay];

  const checkIn = useCallback(() => {
    setMyCheckins((prev) =>
      prev[currentDay] ? prev : { ...prev, [currentDay]: nowHHMM() }
    );
  }, [currentDay, setMyCheckins]);

  // 데모용: 오늘 출석을 취소해 출석 버튼을 다시 띄운다
  const resetTodayCheckin = useCallback(() => {
    setMyCheckins((prev) => {
      if (!prev[currentDay]) return prev;
      const next = { ...prev };
      delete next[currentDay];
      return next;
    });
  }, [currentDay, setMyCheckins]);

  // 홈의 "오늘의 미션" = 서버 기본 미션 + 내가 추가한 미션
  const myMissions = useMemo<Mission[]>(
    () => [...serverMissions, ...extraMissions],
    [serverMissions, extraMissions]
  );

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

  // 데모 편의: 과거 12일치 기록 + 출석을 채우고 13일차로 점프 (오늘은 미출석)
  const seedSample = useCallback(() => {
    const upto = 12;
    const next: CompletionMap = {};
    myMissions.forEach((m, i) => {
      const days: number[] = [];
      for (let d = 1; d <= upto; d++) {
        const skip = (d + i * 3) % 6 === 0; // 몇 칸은 일부러 빼서 벌금 생기게
        if (!skip) days.push(d);
      }
      next[m.id] = days;
    });
    setMyCompletions(next);

    const checkins: CheckinMap = {};
    for (let d = 1; d <= upto; d++) {
      const mm = String((d * 7) % 60).padStart(2, "0");
      checkins[d] = "0" + (7 + (d % 3)) + ":" + mm;
    }
    setMyCheckins(checkins);

    setCurrentDay(upto + 1);
  }, [myMissions, setMyCompletions, setMyCheckins, setCurrentDay]);

  const jumpToEnd = useCallback(() => {
    setCurrentDay(durationDays + 1);
  }, [setCurrentDay, durationDays]);

  const resetProgress = useCallback(() => {
    setCurrentDay(1);
    setMyCompletions({});
    setMyCheckins({});
  }, [setCurrentDay, setMyCompletions, setMyCheckins]);

  const meRecord = useMemo<MemberRecord | null>(() => {
    if (!currentUser) return null;
    return {
      user: meMemberId ? { ...currentUser, id: meMemberId } : currentUser,
      missions: myMissions,
      completions: myCompletions,
    };
  }, [currentUser, meMemberId, myMissions, myCompletions]);

  // 모임/정산이 쓰는 멤버 기록 = 선택된 로컬 모임 기준.
  // 나 → 실제 내 미션·완료 기록, 친구 → 결정론적 목업 기록.
  const allMembers = useMemo<MemberRecord[]>(() => {
    if (!selectedGroup) return meRecord ? [meRecord] : [];
    return groupToMemberRecords(selectedGroup).map((r) => {
      if (r.user.id === meMemberId && meRecord) return meRecord;
      return {
        ...r,
        completions: mockCompletions(r.user.id, r.missions, durationDays),
      };
    });
  }, [selectedGroup, meMemberId, meRecord, durationDays]);

  const value: DemoContextValue = {
    loading,
    error,
    group,
    durationDays,
    groupStore,
    localGroups,
    selectedGroup,
    selectGroup,
    groupName: selectedGroup?.name ?? group?.name ?? "모임",
    groupMembers,
    friends,
    meMemberId,
    currentUser,
    currentDay,
    myMissions,
    extraMissions,
    myCompletions,
    myCheckins,
    checkedInToday,
    checkIn,
    resetTodayCheckin,
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