import type { User } from "../types";
export const hasLiked = (
  likes: (string | User)[] | undefined,
  userId: string | undefined
) =>
  Boolean(
    userId &&
    likes?.some(
      (like) => (typeof like === "string" ? like : like._id) === userId
    )
  );
export const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Math.max(0, Date.now() - date.getTime());
  if (diff < 60000) return "دلوقتي";
  if (diff < 3600000) return `من ${Math.floor(diff / 60000)} دقيقة`;
  if (diff < 86400000) return `من ${Math.floor(diff / 3600000)} ساعة`;
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
