import { useCallback, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { commentService } from "../services/social";
import { errorMessage } from "../services/api";
import { formatTime, hasLiked } from "../services/format";
import useCollection from "../hooks/useCollection";
import type { Comment } from "../types";
import Avatar from "./Avatar";
import MediaForm from "./MediaForm";
import Modal from "./Modal";
import RichText from "./RichText";
import { EmptyState, ErrorState, PaginationControls } from "./Status";

const CommentItem = ({
  comment: initial,
  postId,
  postOwnerId,
  allowReply,
  onDeleted,
}: {
  comment: Comment;
  postId: string;
  postOwnerId: string;
  allowReply: boolean;
  onDeleted: (id: string) => void;
}) => {
  const { user } = useAuth();
  const [changes, setChanges] = useState<Partial<Comment>>({});
  const comment = { ...initial, ...changes };
  const [busy, setBusy] = useState(false);
  const [replies, setReplies] = useState(false);
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const own = user?._id === comment.commentCreator?._id;
  const liked = hasLiked(comment.likes, user?._id);
  const like = async () => {
    const previous = changes;
    const count = comment.likesCount ?? comment.likes?.length ?? 0;
    setBusy(true);
    setChanges((prev) => ({
      ...prev,
      likes: liked
        ? comment.likes?.filter(
            (l) => (typeof l === "string" ? l : l._id) !== user?._id
          )
        : [...(comment.likes || []), user!._id],
      likesCount: Math.max(0, count + (liked ? -1 : 1)),
    }));
    try {
      const result = await commentService.like(postId, comment._id);
      setChanges((prev) => ({
        ...prev,
        likes: result.data.comment.likes,
        likesCount: result.data.likesCount,
      }));
    } catch (e) {
      setChanges(previous);
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const edit = async (text: string, image?: File) => {
    const result = await commentService.update(
      postId,
      comment._id,
      text,
      image
    );
    setChanges((prev) => ({
      ...prev,
      ...result.data.comment,
      content: text,
      commentCreator: comment.commentCreator,
    }));
    setModal(null);
    toast.success("التعليق اتعدل");
  };
  const remove = async () => {
    setBusy(true);
    setDeleteError("");
    try {
      await commentService.remove(postId, comment._id);
      onDeleted(comment._id);
      toast.success("التعليق اتحذف");
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="comment-item">
      <Avatar user={comment.commentCreator} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="comment-bubble">
          <div className="flex items-center justify-between gap-2">
            <Link
              className="font-bold text-sm"
              to={`/users/${comment.commentCreator?._id}`}
            >
              {comment.commentCreator?.name || "مستخدم"}
            </Link>
            <span className="text-[11px] text-slate-400">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <RichText text={comment.content || ""} />
          {comment.image && (
            <img
              src={comment.image}
              alt="صورة التعليق"
              className="comment-image"
              loading="lazy"
            />
          )}
        </div>
        <div className="comment-actions">
          <button
            className={liked ? "text-blue-800" : ""}
            disabled={busy}
            aria-pressed={liked}
            onClick={like}
          >
            إعجاب {comment.likesCount ?? comment.likes?.length ?? 0}
          </button>
          {allowReply && (
            <button onClick={() => setReplies((v) => !v)}>
              {replies ? "إخفاء الردود" : `ردود ${comment.repliesCount || ""}`}
            </button>
          )}
          {own && <button onClick={() => setModal("edit")}>تعديل</button>}
          {(own || user?._id === postOwnerId) && (
            <button className="text-red-500" onClick={() => setModal("delete")}>
              حذف
            </button>
          )}
        </div>
        {replies && (
          <Comments
            postId={postId}
            postOwnerId={postOwnerId}
            parentId={comment._id}
            onCountChange={(delta) =>
              setChanges((prev) => ({
                ...prev,
                repliesCount: Math.max(
                  0,
                  (prev.repliesCount ?? comment.repliesCount ?? 0) + delta
                ),
              }))
            }
          />
        )}
      </div>
      {modal && (
        <Modal
          title={modal === "edit" ? "تعديل التعليق" : "حذف التعليق؟"}
          onClose={() => setModal(null)}
        >
          {deleteError && modal === "delete" && (
            <p className="alert-error mb-4" role="alert">
              {deleteError}
            </p>
          )}
          {modal === "edit" ? (
            <MediaForm
              initialText={comment.content}
              existingImage={comment.image}
              compact
              label="حفظ"
              onSubmit={edit}
            />
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-5">
                التعليق وردوده هيتحذفوا. مش هتقدر ترجعهم.
              </p>
              <button className="btn-danger" disabled={busy} onClick={remove}>
                {busy ? "جاري الحذف..." : "حذف التعليق"}
              </button>
            </>
          )}
        </Modal>
      )}
    </article>
  );
};

const Comments = ({
  postId,
  postOwnerId,
  parentId,
  onCountChange,
}: {
  postId: string;
  postOwnerId: string;
  parentId?: string;
  onCountChange?: (delta: number) => void;
}) => {
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      commentService.list(postId, page, signal, parentId),
    [postId, parentId]
  );
  const list = useCollection(loader);
  const create = async (text: string, image?: File) => {
    const result = await commentService.create(postId, text, image, parentId);
    const item = result.data.comment || result.data.reply;
    if (item)
      list.setData((prev) => ({ ...prev, items: [...prev.items, item] }));
    onCountChange?.(1);
    toast.success(parentId ? "ردك اتبعت" : "تعليقك اتضاف");
  };
  const remove = (id: string) => {
    list.setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== id),
    }));
    onCountChange?.(-1);
  };
  return (
    <section
      className={`comments-panel ${parentId ? "replies-panel" : ""}`}
      aria-label={parentId ? "الردود" : "التعليقات"}
    >
      {list.loading ? (
        <p className="text-xs text-slate-400 py-4" role="status">
          جاري تحميل {parentId ? "الردود" : "التعليقات"}...
        </p>
      ) : list.error ? (
        <ErrorState message={list.error} retry={list.refresh} />
      ) : (
        <>
          {list.items.length === 0 && !parentId && (
            <EmptyState title="ابدأ الحوار" text="خليك أول واحد يشارك رأيه." />
          )}
          {list.items.map((item) => (
            <CommentItem
              key={item._id}
              comment={item}
              postId={postId}
              postOwnerId={postOwnerId}
              allowReply={!parentId}
              onDeleted={remove}
            />
          ))}
          <PaginationControls
            pagination={list.pagination}
            page={list.page}
            setPage={list.setPage}
          />
        </>
      )}
      <MediaForm
        compact
        placeholder={parentId ? "اكتب ردك..." : "اكتب تعليقك..."}
        label={parentId ? "رد" : "تعليق"}
        onSubmit={create}
      />
    </section>
  );
};
export default Comments;
