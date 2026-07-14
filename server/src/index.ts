import express from "express";
import cors from "cors";
import { group, myMissions, DURATION_DAYS } from "./mock.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "set-todo-server" });
});

// 모임(그룹) + 친구(mock) 데이터
app.get("/api/group", (_req, res) => {
  res.json(group);
});

// 친구 목록만
app.get("/api/friends", (_req, res) => {
  res.json(group.members.map((m) => m.user));
});

// 현재 사용자에게 배정된 미션
app.get("/api/missions", (_req, res) => {
  res.json({ durationDays: DURATION_DAYS, missions: myMissions });
});

app.listen(PORT, () => {
  console.log(`[server] mock API listening on http://localhost:${PORT}`);
});
