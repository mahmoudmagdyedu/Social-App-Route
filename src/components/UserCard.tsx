import { followUser } from "../API/API";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../API/API";
import type { User } from "../types";
function UserCard({
  user,
  compact = false,
  initiallyFollowing = false,
}: {
  user: User;
  compact?: boolean;
  initiallyFollowing?: boolean;
}) {
  const { user: me, refreshUser } = useAuth();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const following =
    optimistic ??
    (initiallyFollowing || Boolean(me?.following?.includes(user._id)));
  const [busy, setBusy] = useState(false);
  const handleFollow = async () => {
    setOptimistic(!following);
    setBusy(true);
    try {
      await followUser(user._id);
      await refreshUser();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setOptimistic(null);
      setBusy(false);
    }
  };
  return (
    <div className={compact ? "user-row" : "card user-card"}>
      <Link
        className="flex items-center gap-3 min-w-0"
        to={me?._id === user._id ? "/profile" : `/users/${user._id}`}
      >
        <Avatar user={user} />
        <div className="min-w-0">
          <h3 className="font-bold text-sm truncate">{user.name}</h3>
          <p className="text-xs text-slate-400 mt-1 truncate" dir="ltr">
            @{user.username || "user"}
          </p>
          {!compact && (
            <p className="text-xs text-slate-500 mt-2">
              {user.followersCount || 0} متابع
            </p>
          )}
        </div>
      </Link>
      {me?._id !== user._id && (
        <button
          className={following ? "btn-secondary !text-xs" : "follow-btn"}
          disabled={busy}
          aria-label={`${following ? "إلغاء متابعة" : "متابعة"} ${user.name}`}
          onClick={handleFollow}
        >
          <Icon name={following ? "check" : "plus"} className="size-3.5" />
          {compact ? "" : following ? "متابَع" : "متابعة"}
        </button>
      )}
    </div>
  );
}
export default UserCard;
