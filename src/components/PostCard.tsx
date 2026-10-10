import { updatePost, deletePost, likePost, bookmarkPost, sharePost } from "../API/API";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ApiError, errorMessage } from "../API/API";
import { formatTime, hasLiked } from "../services/format";
import type { Post } from "../types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import Modal from "./Modal";
import MediaForm from "./MediaForm";
import RichText from "./RichText";
import Comments from "./Comments";
import LikesList from "./LikesList";

function PostBody({ post }: { post: Post }) {
  return (
  <>
    <RichText text={post.body || ""} />
    {post.image && (
      <a
        href={post.image}
        target="_blank"
        rel="noreferrer"
        className="post-image-link"
      >
        <img
          className="post-image"
          src={post.image}
          alt="الصورة المرفقة بالمنشور"
          loading="lazy"
        />
      </a>
    )}
  </>
);
}
function PostCard({
  post: initial,
  expanded = false,
  onDeleted,
  onShared,
}: {
  post: Post;
  expanded?: boolean;
  onDeleted?: (id: string) => void;
  onShared?: () => void;
}) {
  const { user } = useAuth();
  const [changes, setChanges] = useState<Partial<Post>>({});
  const post = { ...initial, ...changes };
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showComments, setShowComments] = useState(expanded);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<
    "edit" | "delete" | "share" | "likes" | null
  >(null);
  const [shareText, setShareText] = useState("");
  const [shareError, setShareError] = useState("");
  const own = user?._id === post.user?._id;
  const liked = hasLiked(post.likes, user?._id);
  const count = post.likesCount ?? post.likes?.length ?? 0;
  const like = async () => {
    const previous = changes;
    setBusy(true);
    setChanges((prev) => ({
      ...prev,
      likes: liked
        ? post.likes?.filter(
            (l) => (typeof l === "string" ? l : l._id) !== user?._id
          )
        : [...(post.likes || []), user!._id],
      likesCount: Math.max(0, count + (liked ? -1 : 1)),
    }));
    try {
      const result = await likePost(post._id);
      setChanges((prev) => ({
        ...prev,
        likes: result.data.post.likes,
        likesCount: result.data.likesCount,
      }));
    } catch (e) {
      setChanges(previous);
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const bookmark = async () => {
    const previous = Boolean(post.bookmarked);
    setBusy(true);
    setChanges((prev) => ({ ...prev, bookmarked: !previous }));
    try {
      const result = await bookmarkPost(post._id);
      setChanges((prev) => ({ ...prev, bookmarked: result.data.bookmarked }));
      toast.success(
        result.data.bookmarked ? "اتحفظ في مجموعتك" : "اتشال من المحفوظات"
      );
    } catch (e) {
      setChanges((prev) => ({ ...prev, bookmarked: previous }));
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const edit = async (text: string, image?: File) => {
    const result = await updatePost(post._id, text, image);
    setChanges((prev) => ({ ...prev, ...result.data.post, user: post.user }));
    setModal(null);
    toast.success("المنشور اتعدل");
  };
  const remove = async () => {
    setDeleted(true);
    setModal(null);
    try {
      await deletePost(post._id);
      onDeleted?.(post._id);
      toast.success("المنشور اتحذف");
    } catch (e) {
      setDeleted(false);
      toast.error(errorMessage(e));
    }
  };
  const share = async () => {
    setBusy(true);
    setShareError("");
    try {
      await sharePost(post._id, shareText.trim());
      setChanges((prev) => ({
        ...prev,
        sharesCount: (post.sharesCount || 0) + 1,
      }));
      setModal(null);
      setShareText("");
      toast.success("المنشور اتشارك على صفحتك");
      onShared?.();
    } catch (e) {
      setShareError(
        e instanceof ApiError && e.status === 409
          ? "أنت شاركت المنشور ده قبل كده. هتلاقيه على صفحتك."
          : errorMessage(e)
      );
    } finally {
      setBusy(false);
    }
  };
  if (deleted) return null;
  return (
    <article className="card post-card">
      <header className="post-header">
        <Link
          to={own ? "/profile" : `/users/${post.user?._id}`}
          className="flex gap-3 items-center min-w-0"
        >
          <Avatar user={post.user} />
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate">
              {post.user?.name || "مستخدم"}
            </h2>
            <span className="flex gap-1.5 items-center text-xs text-slate-400 mt-1">
              {formatTime(post.createdAt)} <span>·</span>
              <Icon name="globe" className="size-3" />
            </span>
          </div>
        </Link>
        <div className="relative flex items-center gap-1">
          <button
            className={`icon-btn ${post.bookmarked ? "text-blue-800 bg-blue-50" : ""}`}
            disabled={busy}
            aria-pressed={Boolean(post.bookmarked)}
            aria-label={post.bookmarked ? "إزالة من المحفوظات" : "حفظ المنشور"}
            onClick={bookmark}
          >
            <Icon name="bookmark" filled={post.bookmarked} />
          </button>
          <button
            className="icon-btn"
            aria-label="خيارات المنشور"
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            <Icon name="more" />
          </button>
          {menu && (
            <div className="post-menu">
              <Link to={`/posts/${post._id}`} onClick={() => setMenu(false)}>
                عرض المنشور
              </Link>
              {own && (
                <>
                  <button
                    onClick={() => {
                      setModal("edit");
                      setMenu(false);
                    }}
                  >
                    <Icon name="edit" />
                    تعديل
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => {
                      setModal("delete");
                      setMenu(false);
                    }}
                  >
                    <Icon name="trash" />
                    حذف
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
      <PostBody post={post} />
      {post.sharedPost && (
        <div className="shared-post">
          <Link
            className="flex items-center gap-2 mb-3"
            to={`/users/${post.sharedPost.user?._id}`}
          >
            <Avatar user={post.sharedPost.user} size="sm" />
            <span className="font-bold text-sm">
              {post.sharedPost.user?.name}
            </span>
          </Link>
          <PostBody post={post.sharedPost} />
          <Link
            className="text-xs text-blue-800 mt-3 inline-block"
            to={`/posts/${post.sharedPost._id}`}
          >
            عرض المنشور الأصلي
          </Link>
        </div>
      )}
      <div className="post-stats">
        <button onClick={() => setModal("likes")} aria-label="عرض المعجبين">
          <span className="like-count-icon">
            <Icon name="heart" className="size-3" filled />
          </span>
          {count} إعجاب
        </button>
        <span>
          {post.commentsCount || 0} تعليق <span className="mx-1">·</span>{" "}
          {post.sharesCount || 0} مشاركة
        </span>
      </div>
      <div className="post-actions">
        <button
          className={liked ? "liked" : ""}
          aria-pressed={liked}
          disabled={busy}
          onClick={like}
        >
          <Icon name="heart" filled={liked} />
          إعجاب
        </button>
        <button
          className={showComments ? "liked" : ""}
          aria-expanded={showComments}
          onClick={() => setShowComments((v) => !v)}
        >
          <Icon name="comment" />
          تعليق
        </button>
        <button onClick={() => setModal("share")}>
          <Icon name="share" />
          مشاركة
        </button>
      </div>
      {showComments && (
        <Comments
          postId={post._id}
          postOwnerId={post.user?._id}
          onCountChange={(delta) =>
            setChanges((prev) => ({
              ...prev,
              commentsCount: Math.max(
                0,
                (prev.commentsCount ?? post.commentsCount ?? 0) + delta
              ),
            }))
          }
        />
      )}
      {modal && (
        <Modal
          title={
            modal === "edit"
              ? "عدّل حكايتك"
              : modal === "delete"
                ? "حذف المنشور؟"
                : modal === "likes"
                  ? "الناس اللي عجبتهم الحكاية"
                  : "شارك الحكاية"
          }
          onClose={() => setModal(null)}
        >
          {shareError && modal === "share" && (
            <p className="alert-error mb-4" role="alert">
              {shareError}
            </p>
          )}
          {modal === "edit" ? (
            <MediaForm
              initialText={post.body}
              existingImage={post.image}
              onSubmit={edit}
              label="حفظ التعديل"
            />
          ) : modal === "delete" ? (
            <>
              <p className="text-sm text-slate-500 mb-6">
                المنشور وتعليقاته هيتحذفوا نهائياً. متأكد؟
              </p>
              <button className="btn-danger" onClick={remove}>
                أيوه، احذف المنشور
              </button>
            </>
          ) : modal === "likes" ? (
            <LikesList postId={post._id} />
          ) : (
            <>
              <textarea
                className="input mb-4"
                rows={3}
                maxLength={5000}
                placeholder="ضيف رأيك على المنشور (اختياري)"
                aria-label="رأيك على المشاركة"
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
              />
              <div className="shared-post mb-5">
                <RichText
                  text={post.body || post.sharedPost?.body || "منشور بصورة"}
                />
              </div>
              <button className="btn-primary" disabled={busy} onClick={share}>
                {busy ? "جاري المشاركة..." : "شارك على صفحتي"}
                <Icon name="share" />
              </button>
            </>
          )}
        </Modal>
      )}
    </article>
  );
}
export default PostCard;
