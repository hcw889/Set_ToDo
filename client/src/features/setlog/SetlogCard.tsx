import { Avatar } from "../../components/Avatar";
import type { User } from "../../types";
import type { CardMode, VerificationCard } from "./types";

// 셋로그 오마주: 풀블리드 사진/그라디언트 배경 + 시간 + 캡션 + 우측 액션
export function SetlogCard({
  card,
  mode,
  onApprove,
  onReject,
  resolveUser,
}: {
  card: VerificationCard;
  mode: CardMode;
  onApprove?: () => void;
  onReject?: () => void;
  resolveUser?: (id: string) => User | undefined;
}) {
  const approvers = card.approvedBy
    .map((id) => resolveUser?.(id))
    .filter((u): u is User => !!u);

  return (
    <div className="relative h-[68vh] max-h-[560px] w-full overflow-hidden rounded-3xl bg-slate-800 shadow-lg">
      {/* 배경 */}
      {card.photoDataUrl ? (
        <img
          src={card.photoDataUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${
            card.bg ?? "from-slate-500 to-slate-700"
          }`}
        >
          <span className="text-[7rem] opacity-90">{card.emoji ?? "📷"}</span>
        </div>
      )}

      {/* 가독성 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/40" />

      {/* 좌상단 작성자 */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <Avatar user={card.author} size={36} ring />
        <span className="font-semibold text-white drop-shadow">
          {card.author.name}
        </span>
      </div>

      {/* 상태 배지 (우상단) */}
      <div className="absolute right-4 top-4">
        {card.status === "approved" && (
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
            완료됨 ✓
          </span>
        )}
        {card.status === "rejected" && (
          <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow">
            반려됨 ✕
          </span>
        )}
        {card.status === "pending" && (
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow">
            인증 중 {card.approvedBy.length}/{card.requiredApprovals}
          </span>
        )}
      </div>

      {/* 중앙 시간 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl font-extrabold text-white drop-shadow-lg">
          {card.time}
        </span>
      </div>

      {/* 우측 액션 (친구 카드: 인증/반려) */}
      {mode === "friend" && card.status === "pending" && (
        <div className="absolute bottom-24 right-3 flex flex-col gap-3">
          <ActionButton color="emerald" label="인증" onClick={onApprove}>
            ✓
          </ActionButton>
          <ActionButton color="rose" label="반려" onClick={onReject}>
            ✕
          </ActionButton>
        </div>
      )}

      {/* 하단 캡션 + 진행 */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-lg font-medium text-white drop-shadow">
          {card.caption}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {/* 진행 점 */}
          <div className="flex gap-1">
            {Array.from({ length: card.requiredApprovals }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i < card.approvedBy.length ? "bg-emerald-400" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          {/* 승인자 아바타 */}
          {approvers.length > 0 && (
            <div className="flex -space-x-2">
              {approvers.map((u) => (
                <Avatar key={u.id} user={u} size={22} ring />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  color,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  color: "emerald" | "rose";
  onClick?: () => void;
}) {
  const bg = color === "emerald" ? "bg-emerald-500" : "bg-rose-500";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-90"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${bg} text-xl font-bold text-white shadow-lg`}
      >
        {children}
      </span>
      <span className="text-[11px] font-semibold text-white drop-shadow">
        {label}
      </span>
    </button>
  );
}
