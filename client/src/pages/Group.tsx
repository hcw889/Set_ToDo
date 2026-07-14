import { Avatar } from "../components/Avatar";
import { GroupManager } from "../Group/Group_List/GroupManager";
import { ProgressGrid, GridLegend } from "../components/ProgressGrid";
import {
  computeMembers,
  formatPoints,
  poolTotal,
} from "../lib/points";
import { useDemo } from "../state/DemoContext";

export function Group() {
  const { group, allMembers, currentDay, durationDays, currentUser } = useDemo();

  if (!group) return <p className="text-slate-500">모임을 불러오는 중…</p>;

  const computed = computeMembers(allMembers, currentDay, durationDays);
  const pool = poolTotal(computed);
  const penaltyByUser = new Map(computed.map((c) => [c.user.id, c]));

  return (
    <div className="space-y-4">
      {/* 내 파트: 모임/인원 추가 + 투두리스트 작성란 */}
      <GroupManager />

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-base font-bold">친구들 30일 진행 (데모)</h3>
      </div>

      {/* 공동 벌금 풀 */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-200 p-5 text-slate-800 shadow-sm">
        <p className="text-sm text-slate-600">모임통장 (모인 벌금)</p>
        <p className="mt-1 text-3xl font-extrabold">{formatPoints(pool)}</p>
        <p className="mt-1 text-xs text-slate-600">
          {group.name} · 멤버 {allMembers.length}명 · 30일 챌린지
        </p>
      </div>

      <GridLegend />

      {/* 멤버 목록 */}
      <div className="space-y-3">
        {allMembers.map((member) => {
          const c = penaltyByUser.get(member.user.id);
          const isMe = member.user.id === currentUser?.id;
          return (
            <div
              key={member.user.id}
              className={`rounded-2xl p-4 shadow-sm ${
                isMe ? "bg-violet-50 ring-1 ring-violet-200" : "bg-white"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <Avatar user={member.user} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {member.user.name}
                    {isMe && (
                      <span className="ml-1 text-xs font-bold text-violet-500">
                        (나)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    완료율 {Math.round((c?.completion ?? 1) * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">누적 벌금</p>
                  <p className="font-bold text-rose-500">
                    {formatPoints(c?.penalty ?? 0)}
                  </p>
                </div>
              </div>
              <ProgressGrid
                member={member}
                currentDay={currentDay}
                durationDays={durationDays}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
