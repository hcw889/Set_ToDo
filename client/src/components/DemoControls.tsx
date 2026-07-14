import { useState } from "react";
import { useDemo } from "../state/DemoContext";

// 단일 기기 데모용 시간여행 도구. 실서비스에는 없는 데모 전용 UI.
export function DemoControls() {
  const { advanceDay, seedSample, jumpToEnd, resetProgress, logout } = useDemo();
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-slate-200 bg-amber-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold text-amber-800"
      >
        <span>🛠️ 데모 도구</span>
        <span>{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          <DemoButton onClick={advanceDay}>다음 날로 ▶</DemoButton>
          <DemoButton onClick={seedSample}>샘플 기록 채우기</DemoButton>
          <DemoButton onClick={jumpToEnd}>30일 종료 시뮬레이션</DemoButton>
          <DemoButton onClick={resetProgress}>진행 초기화</DemoButton>
          <DemoButton onClick={logout} danger>
            로그아웃(이름 변경)
          </DemoButton>
        </div>
      )}
    </div>
  );
}

function DemoButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition active:scale-95 ${
        danger
          ? "border-rose-300 bg-white text-rose-600"
          : "border-amber-300 bg-white text-amber-800"
      }`}
    >
      {children}
    </button>
  );
}
