import { getNotifications, readNotification, readAllNotifications } from "../API/API";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { errorMessage } from "../API/API";
import { formatTime } from "../services/format";
import useCollection from "../hooks/useCollection";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import type { Notification } from "../types";
import {
  EmptyState,
  ErrorState,
  PaginationControls,
  Skeleton,
} from "../components/Status";
const labels: Record<string, string> = {
  like: "عجبه منشورك",
  like_post: "عجبه منشورك",
  post_like: "عجبه منشورك",
  comment_post: "علّق على منشورك",
  comment: "علّق على منشورك",
  reply_comment: "رد على تعليقك",
  reply: "رد على تعليقك",
  follow_user: "بدأ يتابعك",
  follow: "بدأ يتابعك",
  share_post: "شارك منشورك",
  share: "شارك منشورك",
  mention_post: "أشار ليك في منشور",
  mention_comment: "أشار ليك في تعليق",
  mention: "أشار ليك",
  like_comment: "عجبه تعليقك",
  comment_like: "عجبه تعليقك",
};
function notificationLink(item: Notification) {
  if (item.type === "follow" || item.entityType === "user")
    return `/users/${item.actor?._id}`;
  const post = item.post || item.entity?.post;
  const postId = typeof post === "string" ? post : post?._id;
  return postId
    ? `/posts/${postId}`
    : item.entityType === "post" && (item.entity?._id || item.entityId)
      ? `/posts/${item.entity?._id || item.entityId}`
      : null;
}
function Notifications() {
  const [unread, setUnread] = useState(false);
  const [busy, setBusy] = useState(false);
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      getNotifications(page, signal, unread),
    [unread]
  );
  const list = useCollection(loader);
  const read = async (id?: string) => {
    setBusy(true);
    try {
      if (id) await readNotification(id);
      else await readAllNotifications();
      list.refresh();
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">خليك قريب من اللي بيحصل</span>
          <h1>إشعاراتك</h1>
          <p>تفاعل جديد، متابعة جديدة، وبداية حوار.</p>
        </div>
        <span className="heading-icon">
          <Icon name="bell" />
        </span>
      </header>
      <div className="feed-toolbar">
        <div className="feed-tabs">
          <button
            className={!unread ? "active" : ""}
            onClick={() => {
              setUnread(false);
              list.setPage(1);
            }}
          >
            الكل
          </button>
          <button
            className={unread ? "active" : ""}
            onClick={() => {
              setUnread(true);
              list.setPage(1);
            }}
          >
            غير مقروءة
          </button>
        </div>
        <button
          className="text-xs text-blue-800 font-bold"
          disabled={busy || list.loading}
          onClick={() => read()}
        >
          تحديد الكل كمقروء
        </button>
      </div>
      {list.loading ? (
        <Skeleton />
      ) : list.error ? (
        <ErrorState message={list.error} retry={list.refresh} />
      ) : (
        <>
          {list.items.length === 0 ? (
            <EmptyState
              title="كل حاجة هادية هنا"
              text="لما حد يتفاعل معاك، إشعاره هيظهر هنا."
            />
          ) : (
            <div className="card overflow-hidden">
              {list.items.map((item) => {
                const target = notificationLink(item);
                return (
                  <article
                    key={item._id}
                    className={`notification-row ${!item.isRead ? "unread" : ""}`}
                  >
                    <Avatar user={item.actor} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <strong>{item.actor?.name || "مستخدم"}</strong>{" "}
                        {labels[item.type] || "اتفاعل معاك"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(item.createdAt)}
                      </p>
                      {target && (
                        <Link
                          to={target}
                          className="text-xs text-blue-800 mt-2 inline-block"
                          onClick={() => {
                            if (!item.isRead) read(item._id);
                          }}
                        >
                          عرض التفاصيل
                        </Link>
                      )}
                    </div>
                    {!item.isRead && (
                      <button
                        className="icon-btn"
                        disabled={busy}
                        aria-label="تحديد كمقروء"
                        onClick={() => read(item._id)}
                      >
                        <Icon name="check" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          <PaginationControls
            pagination={list.pagination}
            page={list.page}
            setPage={list.setPage}
          />
        </>
      )}
    </>
  );
}
export default Notifications;
