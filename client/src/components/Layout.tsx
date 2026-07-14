import { NavLink, Outlet } from "react-router-dom";
import { useDemo } from "../state/DemoContext";
import { DemoControls } from "./DemoControls";

const TABS = [
  { to: "/", label: "홈", icon: "🏠", end: true },
  { to: "/group", label: "모임", icon: "👥", end: false },
  { to: "/settlement", label: "정산", icon: "💰", end: false },
];

// 모바일 앱처럼 보이는 셸: 데스크탑에서는 가운데 폰 프레임, 모바일에서는 전체폭
export function Layout() {
  const { group, currentDay, durationDays } = useDemo();
  const ended = currentDay > durationDays;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-xl sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-3xl sm:overflow-hidden">
      {/* 헤더 */}
      <header className="bg-violet-100 px-4 pb-3 pt-4 text-slate-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">셋투두 · 친구와 함께</p>
            <h1 className="truncate text-lg font-bold">
              {group?.name ?? "모임 불러오는 중…"}
            </h1>
          </div>
          <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-slate-700">
            {ended ? "종료 🎉" : `Day ${currentDay}/${durationDays}`}
          </span>
        </div>
      </header>

      <DemoControls />

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <Outlet />
      </main>

      {/* 하단 탭 */}
      <nav className="grid grid-cols-3 border-t border-slate-200 bg-white">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                isActive ? "text-violet-500" : "text-slate-400"
              }`
            }
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
