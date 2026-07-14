import { Link } from "react-router-dom";
import { ProgressGrid, GridLegend } from "../components/ProgressGrid";
import { completionRate, formatPoints, penaltyForMember } from "../lib/points";
import { useDemo } from "../state/DemoContext";
import { VerificationProvider } from "../features/setlog/VerificationContext";
import { SetlogOverlay } from "../features/setlog/SetlogOverlay";
import { MissionRow } from "../features/setlog/MissionRow";
import { CheckinGate } from "../features/attendance/CheckinGate";
import { AttendanceBoard } from "../features/attendance/AttendanceBoard";
import type { Mission } from "../types";

// 출석 전 미션 목록 (흐려진 배경 역할)
function LockedMission({ mission }: { mission: Mission }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="text-lg">🔒</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-500">{mission.title}</p>
        <p className="mt-0.5 text-xs text-slate-400">출석 후 인증 가능</p>
      </div>
      <span className="shrink-0 rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-400">
        완료
      </span>
    </div>
  );
}

export function Dashboard() {
  const {
    currentUser,
    currentDay,
    durationDays,
    myMissions,
    myCompletions,
    meRecord,
    isDone,
    checkedInToday,
  } = useDemo();

  if (!currentUser) return null;
  const ended = currentDay > durationDays;

  const penalty = penaltyForMember(myMissions, myCompletions, currentDay, durationDays);
  const rate = completionRate(myMissions, myCompletions, currentDay, durationDays);
  const doneToday = myMissions.filter((m) => isDone(m.id, currentDay)).length;
  const allDone = myMissions.length > 0 && doneToday === myMissions.length;

  return (
    <VerificationProvider>
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

        {/* 오늘 누가 시작했는지 (모임 인원과 동기화됨) */}
        {!ended && <AttendanceBoard />}

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
            <div className="flex items-center gap-2">
              {!ended && (
                <span className="text-xs text-slate-500">
                  {doneToday}/{myMissions.length} 완료
                </span>
              )}
              <Link
                to="/todos"
                className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600"
              >
                ＋ 투두 편집
              </Link>
            </div>
          </div>

          {ended ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
              30일 챌린지가 끝났어요. 🎉{" "}
              <Link to="/settlement" className="font-bold underline">
                정산 결과 보기
              </Link>
            </div>
          ) : (
            <>
              {/* 출석 완료 시: 컴팩트 바가 미션 위에 표시 */}
              {checkedInToday && (
                <div className="mb-2">
                  <CheckinGate />
                </div>
              )}

              {/* 미출석 시: 미션 목록 위로 출석 카드가 떠 있음 */}
              <div
                className={`relative ${
                  checkedInToday ? "" : "min-h-[290px]"
                }`}
              >
                <div
                  className={`space-y-2 ${
                    checkedInToday
                      ? ""
                      : "pointer-events-none select-none opacity-40 blur-[2px]"
                  }`}
                >
                  {myMissions.map((m) =>
                    checkedInToday ? (
                      <MissionRow key={m.id} mission={m} />
                    ) : (
                      <LockedMission key={m.id} mission={m} />
                    )
                  )}
                </div>

                {!checkedInToday && (
                  <div className="absolute inset-0 flex items-center justify-center px-2">
                    <div className="w-full animate-pop-in">
                      <CheckinGate />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!ended && checkedInToday && allDone && (
            <div className="mt-3 animate-pop-in rounded-2xl bg-emerald-500 p-4 text-center font-bold text-white">
              오늘 미션 전부 완료! 🎉
              <br />
              <span className="text-sm font-medium text-emerald-50">
                데모 도구의 “다음 날로 ▶”로 하루를 넘겨보세요.
              </span>
            </div>
          )}
        </div>
      </div>
      <SetlogOverlay />
    </VerificationProvider>
  );
}