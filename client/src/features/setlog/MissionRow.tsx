import { MissionCard } from "../../components/MissionCard";
import { useDemo } from "../../state/DemoContext";
import type { Mission } from "../../types";
import { useVerification } from "./VerificationContext";

// 대시보드 미션 항목: 완료 / 인증중 / 반려 / 대기 를 분기. 기존 MissionCard를 재사용해 시각 일관성 유지.
export function MissionRow({ mission }: { mission: Mission }) {
  const { isDone, currentDay, setDone } = useDemo();
  const { startCapture, openFeed, verifyingCardFor } = useVerification();

  const done = isDone(mission.id, currentDay);
  const card = verifyingCardFor(mission.id);

  // 완료됨 (인증 통과 또는 되돌리기 가능)
  if (done) {
    return (
      <MissionCard
        mission={mission}
        done
        onToggle={() => setDone(mission.id, currentDay, false)}
      />
    );
  }

  // 인증 진행 중 (친구 승인 대기)
  if (card && card.status === "pending") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{mission.title}</p>
          <p className="mt-0.5 text-xs text-indigo-600">
            친구 인증 대기 중 · {card.approvedBy.length}/{card.requiredApprovals}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openFeed(mission.id)}
          className="shrink-0 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white active:scale-95"
        >
          인증 중 · 보기
        </button>
      </div>
    );
  }

  // 반려됨 → 다시 인증
  if (card && card.status === "rejected") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{mission.title}</p>
          <p className="mt-0.5 text-xs text-rose-500">
            인증이 반려됐어요. 다시 인증해 주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startCapture(mission)}
          className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white active:scale-95"
        >
          다시 인증
        </button>
      </div>
    );
  }

  // 대기: "완료" 버튼 → 카메라 인증 시작 (기존 MissionCard 재사용)
  return (
    <MissionCard
      mission={mission}
      done={false}
      onToggle={() => startCapture(mission)}
    />
  );
}
