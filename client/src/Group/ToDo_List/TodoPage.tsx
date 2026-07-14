import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../../lib/groupStore";
import { TodoSection } from "./TodoSection";

// 홈 → "오늘의 미션"에서 넘어오는 투두 추가·수정 전용 페이지.
// 어떤 모임의 투두인지 고른 뒤 작성란에서 추가/삭제한다.
export function TodoPage() {
  const navigate = useNavigate();
  const store = useGroups();
  const { groups } = store;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? groups[0] ?? null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-3xl sm:shadow-xl sm:overflow-hidden">
      {/* 헤더 (뒤로가기) */}
      <header className="flex items-center gap-2 bg-indigo-600 px-3 pb-3 pt-4 text-white">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full px-2 py-1 text-lg hover:bg-white/15"
          aria-label="뒤로"
        >
          ←
        </button>
        <div className="min-w-0">
          <p className="text-xs text-indigo-200">투두 추가·수정</p>
          <h1 className="truncate text-lg font-bold">오늘의 미션 편집</h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {groups.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            먼저 그룹 탭에서 모임을 만들어 주세요.
          </p>
        ) : (
          <>
            {/* 모임 선택 */}
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-slate-500">모임 선택</p>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      g.id === selected?.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 투두 작성란 */}
            {selected && <TodoSection group={selected} store={store} />}
          </>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-600"
        >
          완료하고 홈으로
        </button>
      </main>
    </div>
  );
}
