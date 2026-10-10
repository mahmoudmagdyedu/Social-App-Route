import { useState } from "react";
import type { User } from "../types";
function Avatar({
  user,
  size = "md",
}: {
  user?: User | null;
  size?: "sm" | "md" | "lg";
}) {
  const [failedPhoto, setFailedPhoto] = useState<string>();
  return (
    <span
      className={`avatar avatar-${size}`}
      aria-label={user?.name || "مستخدم"}
    >
      {user?.photo && failedPhoto !== user.photo ? (
        <img
          src={user.photo}
          alt=""
          loading="lazy"
          onError={() => setFailedPhoto(user.photo)}
        />
      ) : (
        user?.name?.trim().charAt(0) || "س"
      )}
    </span>
  );
}
export default Avatar;
