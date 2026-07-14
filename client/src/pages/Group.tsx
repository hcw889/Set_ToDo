import { useMemo, useState } from "react";
import { Avatar } from "../components/Avatar";
import { GroupManager } from "../Group/Group_List/GroupManager";
import { ProgressGrid, GridLegend } from "../components/ProgressGrid";
import { computeMembers, formatPoints, poolTotal } from "../lib/points";
import { useGroups, groupToMemberRecords } from "../lib/groupStore";
import { useDemo } from "../state/DemoContext";

export function Group() {
  const { currentDay, durationDays, currentUser } = useDemo();

  // 내 모임(로컬)을 진행 화면의 소스로 사용 → 이름이 일치하고, 인원 추가가 바로 반영됨
  const store = useGroups();
  const { groups } = store;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? groups[0] ?? null;

  const members = useMemo(
    () => (selected ? groupToMemberRecords(selected) : []),
    [selected]
  );
  const computed = computeMembers(members, currentDay, durationDays);
  const pool = poolTotal(computed);
  const penaltyByUser = new Map(computed.map((c) => [c.user.id, c]));

  return (
    <div className="space-y-4">
      {/* 모임/인원 관리 (선택된 모임을 아래 진행 화면과 공유) */}
      <GroupManager
        store={store}
        groups={groups}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
      />

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-base font-bold">멤버 진행 현황</h3>
      </div>

      {/* 공동 벌금 풀 */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-200 p-5 text-slate-800 shadow-sm">
        <p className="text-sm text-slate-600">모임통장 (모인 벌금)</p>
        <p className="mt-1 text-3xl font-extrabold">{formatPoints(pool)}</p>
        <p className="mt-1 text-xs text-slate-600">
          {selected?.name ?? "모임"} · 멤버 {members.length}명 · {durationDays}일 챌린지
        </p>
      </div>

      <GridLegend />

      {/* 멤버 목록 (내 모임 멤버 기준) */}
      {members.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          위에서 인원을 추가하면 여기 진행 현황이 생깁니다.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const c = penaltyByUser.get(member.user.id);
            const isMe = member.user.name === currentUser?.name;
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
