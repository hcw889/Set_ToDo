import { useMemo } from "react";
import { useDemo } from "../../state/DemoContext";
import type { User } from "../../types";
import { SetlogCard } from "./SetlogCard";
import { useVerification } from "./VerificationContext";

// 셋로그식 세로 카드 피드: 내 대기 카드(스트리밍) + 목업 친구 카드(인증/반려)
export function VerificationFeed() {
  const { group, currentUser } = useDemo();
  const { cards, overlay, approve, reject, closeOverlay } = useVerification();

  const friends: User[] = useMemo(
    () => (group?.members ?? []).map((m) => m.user),
    [group]
  );

  const resolveUser = useMemo(() => {
    const map = new Map<string, User>();
    if (currentUser) map.set(currentUser.id, currentUser);
    friends.forEach((f) => map.set(f.id, f));
    return (id: string) => map.get(id);
  }, [friends, currentUser]);

  const myCard = cards.find(
    (c) => c.isMine && c.missionId === overlay.missionId
  );
  const friendCards = cards.filter((c) => !c.isMine);
  const meId = currentUser?.id ?? "me";

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* 상단 바 */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold">오늘의 인증 피드</span>
        <button
          type="button"
          onClick={closeOverlay}
          className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold active:scale-95"
        >
          닫기
        </button>
      </div>

      {/* 내 카드가 승인 완료되면 배너 */}
      {myCard?.status === "approved" && (
        <div className="mx-4 mb-2 animate-pop-in rounded-2xl bg-emerald-500 px-4 py-3 text-center font-bold text-white">
          인증 완료! 🎉 미션이 완료 처리됐어요.
        </div>
      )}

      {/* 피드 */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
        {myCard && (
          <div>
            <p className="mb-1 text-xs font-semibold text-white/60">내 인증</p>
            <SetlogCard card={myCard} mode="mine" resolveUser={resolveUser} />
          </div>
        )}

        {friendCards.length > 0 && (
          <p className="pt-1 text-xs font-semibold text-white/60">
            친구들 인증 (인증/반려 해보세요)
          </p>
        )}
        {friendCards.map((card) => (
          <SetlogCard
            key={card.id}
            card={card}
            mode="friend"
            resolveUser={resolveUser}
            onApprove={() => approve(card.id, meId)}
            onReject={() => reject(card.id, meId)}
          />
        ))}
      </div>
    </div>
  );
}
