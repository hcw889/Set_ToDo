import { CameraCapture } from "./CameraCapture";
import { VerificationFeed } from "./VerificationFeed";
import { useVerification } from "./VerificationContext";

// 전체화면 오버레이. 데스크탑에서는 폰 폭(max-w-md) 유지. 라우팅/레이아웃 무수정.
export function SetlogOverlay() {
  const { overlay } = useVerification();
  if (!overlay.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="mx-auto h-full w-full max-w-md">
        {overlay.step === "camera" ? <CameraCapture /> : <VerificationFeed />}
      </div>
    </div>
  );
}
