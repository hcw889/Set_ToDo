import { Avatar } from "../../components/Avatar";
import { useDemo } from "../../state/DemoContext";
import { friendCheckinTime } from "./mockCheckins";
import type { CheckinRow } from "./types";

// 오늘 누가 시작했는지 보여주는 출석판. 인원은 "모임" 탭의 현재 멤버와 동일하다.
export function AttendanceBoard() {
  const { groupMembers, meMemberId, currentDay, myCheckins, groupName } = useDemo();

  if (groupMembers.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-4 text-center text-xs text-slate-400 shadow-sm">
        모임 탭에서 인원을 추가하면 출석판이 만들어져요.
      </p>
    );
  }

  const rows: CheckinRow[] = groupMembers
    .map((user) => {
      const isMe = user.id === meMemberId;
      return {
        user,
        isMe,
        time: isMe
          ? myCheckins[currentDay] ?? null
          : friendCheckinTime(user, currentDay),
      };
    })
    // 일찍 출석한 순 → 미출석은 뒤로
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  const doneCount = rows.filter((r) => r.time).length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          오늘의 출석{" "}
          <span className="text-slate-400">
            ({doneCount}/{rows.length}명)
          </span>
        </p>
        <span className="max-w-[45%] truncate text-xs text-slate-400">
          {groupName}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {rows.map((r) => (
          <div
            key={r.user.id}
            className={`flex w-14 flex-col items-center gap-1 ${
              r.time ? "" : "opacity-40 grayscale"
            }`}
          >
            <div className="relative">
              <Avatar user={r.user} size={44} ring={r.isMe} />
              {r.time && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
                  ✓
                </span>
              )}
            </div>
            <p className="w-full truncate text-center text-[11px] font-medium text-slate-600">
              {r.isMe ? "나" : r.user.name}
            </p>
            <p className="text-[10px] text-slate-400">{r.time ?? "미출석"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}