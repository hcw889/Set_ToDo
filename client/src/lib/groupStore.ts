// 모임(그룹) · 인원 · 투두리스트를 편집 가능한 로컬 상태로 관리한다.
// 기존 서버 그룹은 읽기 전용 데모라, "내 파트"인 추가/작성 기능은 여기서 담당.
// 나중에 실 백엔드가 생기면 이 훅 내부만 api 호출로 교체하면 된다 (확장 지점).
import { useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { colorForName } from "./auth";

// 규칙: 그룹 인원과 투두 항목은 최소 3개, 최대 5개
export const MIN_MEMBERS = 3;
export const MAX_MEMBERS = 5;
export const MIN_TODOS = 3;
export const MAX_TODOS = 5;

export const DEFAULT_PENALTY = 500;

export interface LocalMember {
  id: string;
  name: string;
  color: string;
}

// 친구가 서로에게 정해주는 미션(투두). assignedTo = 이 투두를 수행할 멤버.
export interface LocalTodo {
  id: string;
  title: string;
  assignedTo: string; // LocalMember.id
  penaltyPoints: number;
}

export interface LocalGroup {
  id: string;
  name: string;
  members: LocalMember[];
  todos: LocalTodo[];
}

const KEY = "settodo:mygroups";
const uid = () => Math.random().toString(36).slice(2, 9);

function member(name: string): LocalMember {
  return { id: uid(), name, color: colorForName(name) };
}

// 최초 1회 시드: 규칙(멤버 3명 이상)을 만족하는 예시 모임 하나
function seed(): LocalGroup[] {
  const members = [member("나"), member("지민"), member("현우")];
  return [
    {
      id: uid(),
      name: "우리 모임",
      members,
      todos: [
        { id: uid(), title: "물 2L 마시기", assignedTo: members[0].id, penaltyPoints: 500 },
        { id: uid(), title: "운동 10분", assignedTo: members[1].id, penaltyPoints: 1000 },
        { id: uid(), title: "책 5쪽 읽기", assignedTo: members[2].id, penaltyPoints: 700 },
      ],
    },
  ];
}

export interface GroupStore {
  groups: LocalGroup[];
  addGroup: (name: string) => LocalGroup | null;
  removeGroup: (groupId: string) => void;
  addMember: (groupId: string, name: string) => string | null; // 실패 시 에러 메시지
  removeMember: (groupId: string, memberId: string) => string | null;
  addTodo: (
    groupId: string,
    todo: { title: string; assignedTo: string; penaltyPoints: number }
  ) => string | null;
  removeTodo: (groupId: string, todoId: string) => string | null;
}

export function useGroups(): GroupStore {
  const [groups, setGroups] = useLocalStorage<LocalGroup[]>(KEY, seed());

  // 특정 그룹만 변형해 새 배열 반환
  const patchGroup = useCallback(
    (groupId: string, fn: (g: LocalGroup) => LocalGroup) =>
      setGroups((prev) => prev.map((g) => (g.id === groupId ? fn(g) : g))),
    [setGroups]
  );

  const addGroup = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      // 새 모임은 규칙상 최소 인원(3명)을 채워 시작
      const created: LocalGroup = {
        id: uid(),
        name: trimmed,
        members: [member("나"), member("친구1"), member("친구2")],
        todos: [],
      };
      setGroups((prev) => [...prev, created]);
      return created;
    },
    [setGroups]
  );

  const removeGroup = useCallback(
    (groupId: string) => setGroups((prev) => prev.filter((g) => g.id !== groupId)),
    [setGroups]
  );

  const addMember = useCallback(
    (groupId: string, name: string): string | null => {
      const trimmed = name.trim();
      if (!trimmed) return "이름을 입력해 주세요.";
      const g = groups.find((x) => x.id === groupId);
      if (!g) return "모임을 찾을 수 없어요.";
      if (g.members.length >= MAX_MEMBERS) return `인원은 최대 ${MAX_MEMBERS}명까지예요.`;
      patchGroup(groupId, (grp) => ({ ...grp, members: [...grp.members, member(trimmed)] }));
      return null;
    },
    [groups, patchGroup]
  );

  const removeMember = useCallback(
    (groupId: string, memberId: string): string | null => {
      const g = groups.find((x) => x.id === groupId);
      if (!g) return "모임을 찾을 수 없어요.";
      if (g.members.length <= MIN_MEMBERS) return `인원은 최소 ${MIN_MEMBERS}명은 있어야 해요.`;
      patchGroup(groupId, (grp) => ({
        ...grp,
        members: grp.members.filter((m) => m.id !== memberId),
        // 나간 멤버에게 배정됐던 투두도 함께 제거
        todos: grp.todos.filter((t) => t.assignedTo !== memberId),
      }));
      return null;
    },
    [groups, patchGroup]
  );

  const addTodo = useCallback(
    (
      groupId: string,
      todo: { title: string; assignedTo: string; penaltyPoints: number }
    ): string | null => {
      const title = todo.title.trim();
      if (!title) return "투두 내용을 입력해 주세요.";
      const g = groups.find((x) => x.id === groupId);
      if (!g) return "모임을 찾을 수 없어요.";
      if (g.todos.length >= MAX_TODOS) return `투두는 최대 ${MAX_TODOS}개까지예요.`;
      if (!g.members.some((m) => m.id === todo.assignedTo)) return "담당자를 선택해 주세요.";
      patchGroup(groupId, (grp) => ({
        ...grp,
        todos: [
          ...grp.todos,
          {
            id: uid(),
            title,
            assignedTo: todo.assignedTo,
            penaltyPoints: Math.max(0, Math.round(todo.penaltyPoints) || 0),
          },
        ],
      }));
      return null;
    },
    [groups, patchGroup]
  );

  const removeTodo = useCallback(
    (groupId: string, todoId: string): string | null => {
      const g = groups.find((x) => x.id === groupId);
      if (!g) return "모임을 찾을 수 없어요.";
      if (g.todos.length <= MIN_TODOS) return `투두는 최소 ${MIN_TODOS}개는 있어야 해요.`;
      patchGroup(groupId, (grp) => ({
        ...grp,
        todos: grp.todos.filter((t) => t.id !== todoId),
      }));
      return null;
    },
    [groups, patchGroup]
  );

  return { groups, addGroup, removeGroup, addMember, removeMember, addTodo, removeTodo };
}
