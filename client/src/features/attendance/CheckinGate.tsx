import { useDemo } from "../../state/DemoContext";
import { computeStreak } from "./streak";

export function CheckinGate() {
  const { currentDay, myCheckins, checkedInToday, checkIn } = useDemo();

  const streak = computeStreak(myCheckins, currentDay);
  const prevStreak = computeStreak(myCheckins, currentDay - 1);

  // 출석 완료 → 컴팩트 바
  if (checkedInToday) {
    return (
      <div className="flex animate-pop-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <span className="text-2xl">✅</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-emerald-700">
            오늘 출석 완료 · {myCheckins[currentDay]}
          </p>
          <p className="mt-0.5 text-xs text-emerald-600">
            {streak}일 연속 출석 중 🔥
          </p>
        </div>
      </div>
    );
  }

  // 미출석 → 큰 버튼
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="text-sm text-slate-500">{currentDay}일차 시작하기</p>
      <h3 className="mt-1 text-lg font-bold">출석해야 오늘의 미션이 열려요</h3>

      <button
        type="button"
        onClick={checkIn}
        className="mx-auto mt-4 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-lg transition active:scale-95"
      >
        <span className="text-3xl">👋</span>
        <span className="mt-1 text-base font-extrabold">출석하기</span>
      </button>

      <p className="mt-3 text-xs text-slate-400">
        {prevStreak > 0
          ? `${prevStreak}일 연속 출석 중이에요. 오늘도 이어가요!`
          : "출석하면 친구들 출석판에도 바로 표시돼요."}
      </p>
    </div>
  );
}