import { useState } from "react";
import { useGroups, MIN_MEMBERS, MAX_MEMBERS, type LocalGroup } from "../../lib/groupStore";

// 그룹 탭 전용: 모임(그룹) 추가·수정, 인원 추가만 담당.
// 투두 작성/수정은 홈 → 투두 페이지(ToDo_List)로 분리됨.
export function GroupManager() {
  const store = useGroups();
  const { groups } = store;

  // 현재 선택된 모임 (없으면 첫 번째)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? groups[0] ?? null;

  return (
    <section className="space-y-4">
      <h3 className="text-base font-bold">내 모임 관리</h3>

      <GroupTabs
        groups={groups}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
        onAdd={(name) => {
          const g = store.addGroup(name);
          if (g) setSelectedId(g.id);
        }}
        onRemove={(id) => {
          store.removeGroup(id);
          setSelectedId(null);
        }}
      />

      {selected && <MemberSection group={selected} store={store} />}
    </section>
  );
}

/* ---------------- 그룹 탭 / 추가·삭제 ---------------- */
function GroupTabs({
  groups,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: {
  groups: LocalGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName("");
    setAdding(false);
  };

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              g.id === selectedId
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {g.name}
          </button>
        ))}
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border border-dashed border-indigo-300 px-3 py-1.5 text-sm font-semibold text-indigo-600"
        >
          ＋ 새 모임
        </button>
      </div>

      {adding && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="새 모임 이름"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            onClick={submit}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            만들기
          </button>
        </div>
      )}

      {groups.length > 1 && selectedId && (
        <button
          onClick={() => {
            if (confirm("이 모임을 삭제할까요?")) onRemove(selectedId);
          }}
          className="mt-2 text-xs text-slate-400 hover:text-rose-500"
        >
          현재 모임 삭제
        </button>
      )}
    </div>
  );
}

/* ---------------- 인원 추가 ---------------- */
function MemberSection({
  group,
  store,
}: {
  group: LocalGroup;
  store: ReturnType<typeof useGroups>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = group.members.length >= MAX_MEMBERS;

  const add = () => {
    const err = store.addMember(group.id, name);
    setError(err);
    if (!err) setName("");
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          인원 <span className="text-slate-400">({group.members.length}명)</span>
        </p>
        <span className="text-xs text-slate-400">
          최소 {MIN_MEMBERS} · 최대 {MAX_MEMBERS}명
        </span>
      </div>

      <ul className="mb-3 space-y-1.5">
        {group.members.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.name.charAt(0) || "?"}
            </span>
            <span className="flex-1 text-sm font-medium">{m.name}</span>
            <button
              onClick={() => setError(store.removeMember(group.id, m.id))}
              className="text-xs text-slate-300 hover:text-rose-500"
              aria-label="삭제"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={full ? "인원이 가득 찼어요" : "추가할 인원 이름"}
          disabled={full}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
        />
        <button
          onClick={add}
          disabled={full}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          인원 추가
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
