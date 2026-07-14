import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Group } from "./pages/Group";
import { Settlement } from "./pages/Settlement";
import { Onboarding } from "./pages/Onboarding";
import { TodoPage } from "./Group/ToDo_List/TodoPage";
import { DemoProvider, useDemo } from "./state/DemoContext";

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center text-slate-500">
      {children}
    </div>
  );
}

function Gate() {
  const { currentUser, loading, error } = useDemo();

  if (loading) return <FullScreen>불러오는 중…</FullScreen>;
  if (error)
    return (
      <FullScreen>
        <div>
          <p className="font-semibold text-rose-500">서버에 연결하지 못했어요.</p>
          <p className="mt-1 text-sm">
            {error}
            <br />
            터미널에서 <code className="rounded bg-slate-200 px-1">npm run dev</code>{" "}
            로 서버가 함께 켜졌는지 확인해 주세요.
          </p>
        </div>
      </FullScreen>
    );
  if (!currentUser) return <Onboarding />;

  return (
    <Routes>
      {/* 투두 편집은 탭바 없는 전체 화면 */}
      <Route path="todos" element={<TodoPage />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="group" element={<Group />} />
        <Route path="settlement" element={<Settlement />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Gate />
      </DemoProvider>
    </BrowserRouter>
  );
}
