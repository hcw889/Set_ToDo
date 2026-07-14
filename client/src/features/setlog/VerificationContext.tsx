import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDemo } from "../../state/DemoContext";
import type { Mission, User } from "../../types";
import { buildMockCards } from "./mockCards";
import type { VerificationCard } from "./types";

const APPROVE_INTERVAL_MS = 2000; // 목업: n초에 한 명씩 승인

interface OverlayState {
  open: boolean;
  step: "camera" | "feed";
  missionId?: string;
}

interface VerificationContextValue {
  cards: VerificationCard[];
  overlay: OverlayState;
  startCapture: (mission: Mission) => void;
  openFeed: (missionId: string) => void;
  submitPhoto: (photoDataUrl: string, caption: string) => void;
  approve: (cardId: string, byUserId: string) => void;
  reject: (cardId: string, byUserId: string) => void;
  closeOverlay: () => void;
  verifyingCardFor: (missionId: string) => VerificationCard | undefined;
}

const Ctx = createContext<VerificationContextValue | null>(null);

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { group, currentUser, currentDay, setDone } = useDemo();

  const friends: User[] = useMemo(
    () => (group?.members ?? []).map((m) => m.user),
    [group]
  );

  const [cards, setCards] = useState<VerificationCard[]>([]);
  const [overlay, setOverlay] = useState<OverlayState>({
    open: false,
    step: "camera",
  });

  // 친구 목업 카드는 그룹 로드 후 1회 세팅
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && friends.length > 0) {
      seeded.current = true;
      setCards(buildMockCards(friends));
    }
  }, [friends]);

  // 타이머 정리를 위해 cards를 ref로도 보관
  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const timers = useRef<Record<string, number>>({});
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((t) => clearInterval(t));
    };
  }, []);

  const startCapture = useCallback((mission: Mission) => {
    setOverlay({ open: true, step: "camera", missionId: mission.id });
  }, []);

  const openFeed = useCallback((missionId: string) => {
    setOverlay({ open: true, step: "feed", missionId });
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlay((o) => ({ ...o, open: false }));
  }, []);

  // 내 인증 사진 제출 → pending 카드 생성 후 목업 승인 스트리밍 시작
  const submitPhoto = useCallback(
    (photoDataUrl: string, caption: string) => {
      const missionId = overlay.missionId;
      if (!missionId || !currentUser) return;

      const required = Math.max(1, friends.length);
      const cardId = `mine-${missionId}-${Date.now()}`;
      const dayAtSubmit = currentDay;

      const myCard: VerificationCard = {
        id: cardId,
        author: currentUser,
        isMine: true,
        missionId,
        photoDataUrl,
        caption: caption.trim() || "인증합니다!",
        time: nowHHMM(),
        requiredApprovals: required,
        approvedBy: [],
        rejectedBy: [],
        status: "pending",
      };

      setCards((prev) => [myCard, ...prev.filter((c) => c.missionId !== missionId || !c.isMine)]);
      setOverlay((o) => ({ ...o, step: "feed" }));

      // 스트리밍 승인
      const friendIds = friends.map((f) => f.id);
      const tick = () => {
        const card = cardsRef.current.find((c) => c.id === cardId);
        if (!card || card.status !== "pending") {
          clearInterval(timers.current[cardId]);
          delete timers.current[cardId];
          return;
        }
        const nextId = friendIds.find((id) => !card.approvedBy.includes(id));
        if (!nextId) return;
        const newApproved = [...card.approvedBy, nextId];
        const done = newApproved.length >= card.requiredApprovals;
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...c, approvedBy: newApproved, status: done ? "approved" : "pending" }
              : c
          )
        );
        if (done) {
          clearInterval(timers.current[cardId]);
          delete timers.current[cardId];
          setDone(missionId, dayAtSubmit, true);
        }
      };
      timers.current[cardId] = window.setInterval(tick, APPROVE_INTERVAL_MS);
    },
    [overlay.missionId, currentUser, currentDay, friends, setDone]
  );

  // 사용자가 목업 친구 카드에 인증/반려
  const approve = useCallback((cardId: string, byUserId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId || c.status !== "pending") return c;
        if (c.approvedBy.includes(byUserId)) return c;
        const approvedBy = [...c.approvedBy, byUserId];
        const status = approvedBy.length >= c.requiredApprovals ? "approved" : "pending";
        return { ...c, approvedBy, status };
      })
    );
  }, []);

  const reject = useCallback((cardId: string, byUserId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId || c.status !== "pending") return c;
        return {
          ...c,
          rejectedBy: c.rejectedBy.includes(byUserId)
            ? c.rejectedBy
            : [...c.rejectedBy, byUserId],
          status: "rejected",
        };
      })
    );
  }, []);

  const verifyingCardFor = useCallback(
    (missionId: string) =>
      cards.find((c) => c.isMine && c.missionId === missionId),
    [cards]
  );

  const value: VerificationContextValue = {
    cards,
    overlay,
    startCapture,
    openFeed,
    submitPhoto,
    approve,
    reject,
    closeOverlay,
    verifyingCardFor,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVerification(): VerificationContextValue {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
}
