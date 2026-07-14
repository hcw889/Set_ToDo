import { dayStatus } from "../lib/points";
import type { DayStatus, MemberRecord } from "../types";

const STATUS_STYLE: Record<DayStatus, string> = {
  done: "bg-emerald-500",
  partial: "bg-amber-400",
  missed: "bg-rose-400",
  today: "bg-indigo-500 ring-2 ring-indigo-300 ring-offset-1",
  future: "bg-slate-200",
};

// 멤버의 durationDays 만큼의 진행 상황을 작은 칸들로 표시
export function ProgressGrid({
  member,
  currentDay,
  durationDays,
}: {
  member: MemberRecord;
  currentDay: number;
  durationDays: number;
}) {
  const days = Array.from({ length: durationDays }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map((d) => {
        const status = dayStatus(
          member.missions,
          member.completions,
          d,
          currentDay,
          durationDays
        );
        return (
          <div
            key={d}
            className={`aspect-square rounded-[3px] ${STATUS_STYLE[status]}`}
            title={`${d}일차`}
          />
        );
      })}
    </div>
  );
}

export function GridLegend() {
  const items: { label: string; status: DayStatus }[] = [
    { label: "완료", status: "done" },
    { label: "일부", status: "partial" },
    { label: "미완료", status: "missed" },
    { label: "오늘", status: "today" },
    { label: "예정", status: "future" },
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
      {items.map((it) => (
        <span key={it.status} className="flex items-center gap-1">
          <span className={`h-3 w-3 rounded-[3px] ${STATUS_STYLE[it.status]}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
