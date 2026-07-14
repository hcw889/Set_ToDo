// 셋로그식 사진 인증 기능의 feature-local 타입 (공유 types.ts는 건드리지 않음)
import type { User } from "../../types";

export type VerifyStatus = "pending" | "approved" | "rejected";

export interface VerificationCard {
  id: string;
  author: User;
  isMine: boolean;
  missionId?: string; // 내 카드에만: 완료 처리 연결용
  photoDataUrl?: string; // 내 카드: 촬영 결과
  bg?: string; // 목업 카드: 그라디언트 배경 (tailwind class)
  emoji?: string; // 목업 카드: 장면 이모지
  caption: string;
  time: string; // "12:00"
  requiredApprovals: number;
  approvedBy: string[]; // user id 목록
  rejectedBy: string[]; // user id 목록
  status: VerifyStatus;
}

export type CardMode = "mine" | "friend";
