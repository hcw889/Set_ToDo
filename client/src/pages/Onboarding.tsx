import { useState } from "react";
import { useDemo } from "../state/DemoContext";

// 로그인 대체: 이름만 받아 현재 사용자를 만든다 (실인증은 확장 지점으로만 남김)
export function Onboarding() {
  const { login } = useDemo();
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) login(name);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-gradient-to-b from-violet-100 to-indigo-100 px-6 text-slate-800">
      <div className="animate-pop-in">
        <p className="text-5xl">🤝</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight">
          친구와 함께
          <br />
          30일 미션 챌린지
        </h1>
        <p className="mt-3 text-slate-600">
          친구가 정해준 미션을 매일 완료하세요. 못 지키면 벌금 포인트가 쌓이고,
          30일 뒤 모아둔 포인트를 잘 지킨 사람이 나눠 가져요.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label className="text-sm font-medium text-slate-600">
            이름(닉네임)
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            autoFocus
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-900 outline-none ring-2 ring-transparent focus:ring-violet-300"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-4 w-full rounded-2xl bg-violet-300 py-3.5 text-lg font-bold text-slate-800 transition active:scale-[0.98] disabled:opacity-50"
          >
            시작하기
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          * 데모 버전이라 로그인 없이 이름만 입력해요.
        </p>
      </div>
    </div>
  );
}
