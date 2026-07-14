import type { User } from "../types";

// 이름 첫 글자를 색 원 안에 표시하는 아바타
export function Avatar({
  user,
  size = 40,
  ring = false,
}: {
  user: User;
  size?: number;
  ring?: boolean;
}) {
  const letter = user.name.trim().charAt(0) || "?";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
        ring ? "ring-2 ring-white" : ""
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: user.avatarColor,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
