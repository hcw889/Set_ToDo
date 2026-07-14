import { formatPoints } from "../lib/points";
import type { Mission } from "../types";

// 오늘의 미션 한 개 + 완료 버튼
export function MissionCard({
  mission,
  done,
  disabled,
  onToggle,
}: {
  mission: Mission;
  done: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
        done
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold ${
            done ? "text-emerald-700 line-through decoration-emerald-400" : "text-slate-900"
          }`}
        >
          {mission.title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {mission.assignedBy} 님이 정한 미션 · 미완료 시 벌금 {formatPoints(mission.penaltyPoints)}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 disabled:opacity-40 ${
          done
            ? "bg-emerald-500 text-white"
            : "bg-slate-900 text-white hover:bg-slate-700"
        }`}
      >
        {done ? "완료됨 ✓" : "완료"}
      </button>
    </div>
  );
}
