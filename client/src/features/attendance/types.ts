import type { User } from "../../types";

export interface CheckinRow {
  user: User;
  time: string | null; // "08:12" · null이면 아직 미출석
  isMe: boolean;
}