import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 중에는 /api 요청을 Express(4000)로 프록시 → CORS 신경 X, api.ts는 상대경로만 사용
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
