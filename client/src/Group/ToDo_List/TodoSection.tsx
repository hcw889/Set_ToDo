import { useState } from "react";
import {
  useGroups,
  MIN_TODOS,
  MAX_TODOS,
  DEFAULT_PENALTY,
  type LocalGroup,
} from "../../lib/groupStore";

// ToDo_List 담당: 각자 추가해줄 투두리스트 작성란 (최소 3 · 최대 5개)
export function TodoSection({
  group,
  store,
}: {
  group: LocalGroup;
  store: ReturnType<typeof useGroups>;
}) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>(group.members[0]?.id ?? "");
  const [penalty, setPenalty] = useState<number>(DEFAULT_PENALTY);
  const [error, setError] = useState<string | null>(null);

  const full = group.todos.length >= MAX_TODOS;
  const nameOf = (id: string) =>
    group.members.find((m) => m.id === id)?.name ?? "?";

  const add = () => {
    const err = store.addTodo(group.id, { title, assignedTo, penaltyPoints: penalty });
    setError(err);
    if (!err) {
      setTitle("");
      setPenalty(DEFAULT_PENALTY);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          투두리스트{" "}
          <span className="text-slate-400">({group.todos.length}개)</span>
        </p>
        <span className="text-xs text-slate-400">
          최소 {MIN_TODOS} · 최대 {MAX_TODOS}개
        </span>
      </div>

      {group.todos.length === 0 ? (
        <p className="mb-3 rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
          아직 투두가 없어요. 서로에게 미션을 하나씩 정해주세요.
        </p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {group.todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-slate-400">
                  담당: {nameOf(t.assignedTo)} · 벌금{" "}
                  {t.penaltyPoints.toLocaleString("ko-KR")}P
                </p>
              </div>
              <button
                onClick={() => setError(store.removeTodo(group.id, t.id))}
                className="text-xs text-slate-300 hover:text-rose-500"
                aria-label="삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 작성란 */}
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={full ? "투두가 가득 찼어요" : "투두 내용 (예: 물 2L 마시기)"}
          disabled={full}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
        />
        <div className="flex gap-2">
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            disabled={full}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step={100}
            value={penalty}
            onChange={(e) => setPenalty(Number(e.target.value))}
            disabled={full}
            className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
            aria-label="벌금 포인트"
          />
        </div>
        <button
          onClick={add}
          disabled={full}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          투두 추가
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
