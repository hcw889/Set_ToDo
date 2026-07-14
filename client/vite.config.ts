import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 중에는 /api 요청을 Express(4000)로 프록시 → CORS 신경 X, api.ts는 상대경로만 사용
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // 0.0.0.0 바인딩 → 같은 Wi-Fi의 휴대폰에서 http://<PC-IP>:5173 접속 가능
    allowedHosts: true, // ngrok/cloudflared 같은 터널 도메인 접속 허용 (데모용)
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
