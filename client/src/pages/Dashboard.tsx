import { Link } from "react-router-dom";
import { MissionCard } from "../components/MissionCard";
import { ProgressGrid, GridLegend } from "../components/ProgressGrid";
import {
  completionRate,
  formatPoints,
  penaltyForMember,
} from "../lib/points";
import { useDemo } from "../state/DemoContext";

export function Dashboard() {
  const {
    currentUser,
    currentDay,
    durationDays,
    myMissions,
    myCompletions,
    meRecord,
    isDone,
    setDone,
  } = useDemo();

  if (!currentUser) return null;
  const ended = currentDay > durationDays;

  const penalty = penaltyForMember(
    myMissions,
    myCompletions,
    currentDay,
    durationDays
  );
  const rate = completionRate(myMissions, myCompletions, currentDay, durationDays);
  const doneToday = myMissions.filter((m) => isDone(m.id, currentDay)).length;
  const allDone = myMissions.length > 0 && doneToday === myMissions.length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">안녕하세요,</p>
        <h2 className="text-2xl font-bold">{currentUser.name} 님 👋</h2>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">지금까지 완료율</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {Math.round(rate * 100)}%
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">내 누적 벌금</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">
            {formatPoints(penalty)}
          </p>
        </div>
      </div>

      {/* 내 진행 그리드 */}
      {meRecord && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">나의 30일 기록</p>
            <span className="text-xs text-slate-400">
              {ended ? "종료" : `${currentDay}일차`}
            </span>
          </div>
          <ProgressGrid
            member={meRecord}
            currentDay={currentDay}
            durationDays={durationDays}
          />
          <div className="mt-2">
            <GridLegend />
          </div>
        </div>
      )}

      {/* 오늘의 미션 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">
            {ended ? "미션 (종료됨)" : `오늘의 미션 · ${currentDay}일차`}
          </h3>
          {!ended && (
            <span className="text-xs text-slate-500">
              {doneToday}/{myMissions.length} 완료
            </span>
          )}
        </div>

        {ended ? (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
            30일 챌린지가 끝났어요. 🎉{" "}
            <Link to="/settlement" className="font-bold underline">
              정산 결과 보기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myMissions.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                done={isDone(m.id, currentDay)}
                onToggle={() => setDone(m.id, currentDay, !isDone(m.id, currentDay))}
              />
            ))}
          </div>
        )}

        {!ended && allDone && (
          <div className="mt-3 animate-pop-in rounded-2xl bg-emerald-500 p-4 text-center font-bold text-white">
            오늘 미션 전부 완료! 🎉<br />
            <span className="text-sm font-medium text-emerald-50">
              데모 도구의 “다음 날로 ▶”로 하루를 넘겨보세요.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
