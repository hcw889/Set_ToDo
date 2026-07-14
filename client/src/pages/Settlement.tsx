import { useState } from "react";
import { Avatar } from "../components/Avatar";
import {
  computeMembers,
  formatPoints,
  poolTotal,
  settlement,
} from "../lib/points";
import { useDemo } from "../state/DemoContext";
import type { DistributionRule } from "../types";

const RULE_LABEL: Record<DistributionRule, string> = {
  winner: "한 명 몰아주기",
  proportional: "잘 지킨 만큼 분배",
};

const RULE_DESC: Record<DistributionRule, string> = {
  winner: "벌금이 가장 적은(가장 잘 지킨) 사람이 모인 벌금을 전부 가져가요.",
  proportional: "잘 지킨 사람일수록 더 많이 돌려받아요. (벌금에 반비례해 분배)",
};

export function Settlement() {
  const { group, allMembers, currentDay, durationDays, currentUser } = useDemo();
  const [rule, setRule] = useState<DistributionRule>(
    group?.distributionRule ?? "proportional"
  );

  if (!group) return <p className="text-slate-500">불러오는 중…</p>;

  const ended = currentDay > durationDays;
  const computed = computeMembers(allMembers, currentDay, durationDays);
  const pool = poolTotal(computed);
  const payouts = settlement(computed, rule).sort((a, b) => b.share - a.share);
  const topShare = payouts[0]?.share ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {ended ? "최종 정산 결과 🎉" : "예상 정산 (현재 기준)"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {ended
            ? "30일 챌린지가 끝나 모인 벌금을 나눠요."
            : "지금까지 쌓인 벌금 기준의 미리보기예요. 30일이 끝나면 확정됩니다."}
        </p>
      </div>

      {/* 규칙 선택 */}
      <div className="rounded-2xl bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RULE_LABEL) as DistributionRule[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRule(r)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                rule === r
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {RULE_LABEL[r]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{RULE_DESC[rule]}</p>
      </div>

      {/* 풀 */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-sm">
        <p className="text-sm text-emerald-50">나눠 가질 모임통장</p>
        <p className="mt-1 text-3xl font-extrabold">{formatPoints(pool)}</p>
      </div>

      {/* 분배 결과 */}
      <div className="space-y-2">
        {payouts.map((p) => {
          const isMe = p.user.id === currentUser?.id;
          const isTop = p.share === topShare && topShare > 0;
          return (
            <div
              key={p.user.id}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm ${
                isMe ? "bg-indigo-50 ring-1 ring-indigo-200" : "bg-white"
              }`}
            >
              <Avatar user={p.user} size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.user.name}
                  {isMe && (
                    <span className="ml-1 text-xs font-bold text-indigo-500">
                      (나)
                    </span>
                  )}
                  {isTop && <span className="ml-1">👑</span>}
                </p>
                <p className="text-xs text-slate-500">
                  낸 벌금 {formatPoints(p.penalty)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">돌려받기</p>
                <p className="font-bold text-emerald-600">
                  {formatPoints(p.share)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    p.net >= 0 ? "text-emerald-500" : "text-rose-400"
                  }`}
                >
                  {p.net >= 0 ? "+" : ""}
                  {formatPoints(p.net)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="pb-2 text-center text-xs text-slate-400">
        * 데모의 정산 규칙/수식은 예시이며 실제 서비스에서 조정될 수 있어요.
      </p>
    </div>
  );
}
