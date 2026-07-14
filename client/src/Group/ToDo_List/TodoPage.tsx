import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "../../state/DemoContext";

// 홈 "오늘의 미션"에서 넘어오는 투두(미션) 추가·수정 페이지.
// 여기서 추가/삭제하면 DemoContext의 myMissions에 반영 → 홈 오늘의 미션과 연동된다.
const DEFAULT_PENALTY = 500;

export function TodoPage() {
  const navigate = useNavigate();
  const { myMissions, extraMissions, addMission, removeMission } = useDemo();

  const [title, setTitle] = useState("");
  const [penalty, setPenalty] = useState<number>(DEFAULT_PENALTY);

  const extraIds = new Set(extraMissions.map((m) => m.id));

  const submit = () => {
    if (!title.trim()) return;
    addMission({ title, penaltyPoints: penalty });
    setTitle("");
    setPenalty(DEFAULT_PENALTY);
  };

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
        {/* 미션 목록 (홈과 동일한 myMissions) */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">
            오늘의 미션{" "}
            <span className="text-slate-400">({myMissions.length}개)</span>
          </p>
          {myMissions.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
              미션이 없어요. 아래에서 추가해 보세요.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {myMissions.map((m) => {
                const removable = extraIds.has(m.id);
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-slate-400">
                        벌금 {m.penaltyPoints.toLocaleString("ko-KR")}P
                      </p>
                    </div>
                    {removable ? (
                      <button
                        onClick={() => removeMission(m.id)}
                        className="text-xs text-slate-300 hover:text-rose-500"
                        aria-label="삭제"
                      >
                        ✕
                      </button>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        기본
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 작성란 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">새 미션 추가</p>
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="미션 내용 (예: 물 2L 마시기)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
                <span className="text-xs text-slate-400">벌금</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={penalty}
                  onChange={(e) => setPenalty(Number(e.target.value))}
                  className="w-full py-2 text-sm outline-none"
                  aria-label="벌금 포인트"
                />
                <span className="text-xs text-slate-400">P</span>
              </div>
              <button
                onClick={submit}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
              >
                추가
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            추가한 미션은 홈 “오늘의 미션”에 바로 나타나요.
          </p>
        </div>

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
