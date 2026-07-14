import { useRef, useState } from "react";
import { useVerification } from "./VerificationContext";

// 네이티브 카메라(<input capture>)로 인증 사진 촬영 → 미리보기 + 캡션 → 제출.
// http LAN에서도 동작 (getUserMedia 미사용).
export function CameraCapture() {
  const { submitPhoto, closeOverlay } = useVerification();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col bg-black text-white">
      {/* 상단 바 */}
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={closeOverlay}
          className="text-2xl leading-none"
          aria-label="닫기"
        >
          ✕
        </button>
        <span className="text-sm font-semibold">미션 인증</span>
        <span className="w-6" />
      </div>

      {/* 숨긴 네이티브 카메라 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />

      {!preview ? (
        // 촬영 안내
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="text-7xl">📸</div>
          <div>
            <p className="text-xl font-bold">인증 사진을 찍어주세요</p>
            <p className="mt-2 text-sm text-white/70">
              친구들이 확인하고 인증해 줘요. 미션을 수행한 모습을 담아보세요!
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-white px-8 py-3.5 text-lg font-bold text-black active:scale-95"
          >
            카메라 열기
          </button>
        </div>
      ) : (
        // 미리보기 + 캡션
        <div className="flex flex-1 flex-col">
          <div className="relative mx-4 flex-1 overflow-hidden rounded-3xl">
            <img
              src={preview}
              alt="인증 미리보기"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="한마디 남기기 (예: 운동 완료!)"
              maxLength={40}
              className="absolute inset-x-4 bottom-4 rounded-full border-0 bg-white/90 px-4 py-2.5 text-slate-900 outline-none"
            />
          </div>
          <div className="flex gap-3 p-4">
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setCaption("");
              }}
              className="rounded-2xl bg-white/15 px-5 py-3 font-semibold active:scale-95"
            >
              다시 찍기
            </button>
            <button
              type="button"
              onClick={() => submitPhoto(preview, caption)}
              className="flex-1 rounded-2xl bg-indigo-500 py-3 text-lg font-bold active:scale-95"
            >
              인증 요청 보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
