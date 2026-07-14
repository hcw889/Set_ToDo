import { Avatar } from "../components/Avatar";
import { GroupManager } from "../Group/Group_List/GroupManager";
import { ProgressGrid, GridLegend } from "../components/ProgressGrid";
import { computeMembers, formatPoints, poolTotal } from "../lib/points";
import { useDemo } from "../state/DemoContext";

export function Group() {
  const {
    currentDay,
    durationDays,
    groupStore,
    localGroups,
    selectedGroup,
    selectGroup,
    allMembers,
    meMemberId,
  } = useDemo();

  const computed = computeMembers(allMembers, currentDay, durationDays);
  const pool = poolTotal(computed);
  const byUser = new Map(computed.map((c) => [c.user.id, c]));

  return (
    <div className="space-y-4">
      {/* 모임/인원 관리 — 여기서 바꾸면 홈 출석판·정산에 즉시 반영된다 */}
      <GroupManager
        store={groupStore}
        groups={localGroups}
        selectedId={selectedGroup?.id ?? null}
        onSelect={selectGroup}
      />

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-base font-bold">멤버 진행 현황</h3>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-200 p-5 text-slate-800 shadow-sm">
        <p className="text-sm text-slate-600">모임통장 (모인 벌금)</p>
        <p className="mt-1 text-3xl font-extrabold">{formatPoints(pool)}</p>
        <p className="mt-1 text-xs text-slate-600">
          {selectedGroup?.name ?? "모임"} · 멤버 {allMembers.length}명 ·{" "}
          {durationDays}일 챌린지
        </p>
      </div>

      <GridLegend />

      {allMembers.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          위에서 인원을 추가하면 여기 진행 현황이 생깁니다.
        </p>
      ) : (
        <div className="space-y-3">
          {allMembers.map((member) => {
            const c = byUser.get(member.user.id);
            const isMe = member.user.id === meMemberId;
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
      )}
    </div>
  );
}