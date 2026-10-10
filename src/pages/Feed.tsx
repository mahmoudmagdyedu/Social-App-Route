import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { postService } from "../services/social";
import useCollection from "../hooks/useCollection";
import Composer from "../components/Composer";
import PostCard from "../components/PostCard";
import Icon from "../components/Icon";
import {
  EmptyState,
  ErrorState,
  PaginationControls,
  Skeleton,
} from "../components/Status";
const Feed = ({ bookmarks = false }: { bookmarks?: boolean }) => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const following = params.get("tab") === "following";
  const images = params.get("images") === "true";
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      bookmarks
        ? postService.bookmarks(page, signal)
        : postService.list(page, signal, following, images),
    [bookmarks, following, images]
  );
  const list = useCollection(loader);
  const refresh = () => {
    list.setPage(1);
    list.refresh();
  };
  const remove = (id: string) =>
    list.setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== id),
    }));
  const filter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
    list.setPage(1);
  };
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">
            {bookmarks ? "حكايات تستاهل ترجع لها" : "يوم جديد، حكاية جديدة"}
          </span>
          <h1>
            {bookmarks ? "محفوظاتك" : `أهلاً، ${user?.name?.split(" ")[0]} 👋`}
          </h1>
          <p>
            {bookmarks
              ? "كل اللي عجبك، في مكان واحد."
              : "شوف جديد دايرتك، وشاركهم لحظة من يومك."}
          </p>
        </div>
        <span className="heading-icon">
          <Icon name={bookmarks ? "bookmark" : "spark"} />
        </span>
      </header>
      {!bookmarks && <Composer onCreated={refresh} />}
      <div className="feed-toolbar">
        {bookmarks ? (
          <h2 className="font-bold text-sm">المنشورات المحفوظة</h2>
        ) : (
          <div className="feed-tabs">
            <button
              className={!following ? "active" : ""}
              onClick={() => filter("tab", "all")}
            >
              لك
            </button>
            <button
              className={following ? "active" : ""}
              onClick={() => filter("tab", "following")}
            >
              بتتابعهم
            </button>
          </div>
        )}
        {!bookmarks && (
          <label className="image-filter">
            <input
              type="checkbox"
              checked={images}
              onChange={(e) => filter("images", String(e.target.checked))}
            />
            <Icon name="image" className="size-4" />
            صور بس
          </label>
        )}
        <button
          className="icon-btn"
          aria-label="تحديث المنشورات"
          disabled={list.loading}
          onClick={refresh}
        >
          <Icon name="globe" className="size-4" />
        </button>
      </div>
      {list.loading ? (
        <Skeleton />
      ) : list.error ? (
        <ErrorState message={list.error} retry={list.refresh} />
      ) : (
        <>
          <div className="space-y-5">
            {list.items.length === 0 && (
              <EmptyState
                title={
                  bookmarks
                    ? "لسه مجموعتك فاضية"
                    : following
                      ? "دايرتك لسه بتكبر"
                      : "لسه مفيش حكايات هنا"
                }
                text={
                  bookmarks
                    ? "اضغط علامة الحفظ على أي منشور عشان ترجع له بسهولة."
                    : following
                      ? "اكتشف ناس جديدة وتابعهم عشان تشوف منشوراتهم هنا."
                      : "جرّب تغيير الفلتر، أو ابدأ أنت بأول منشور."
                }
              />
            )}
            {list.items.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={remove}
                onShared={refresh}
              />
            ))}
          </div>
          <PaginationControls
            pagination={list.pagination}
            page={list.page}
            setPage={list.setPage}
          />
        </>
      )}
    </>
  );
};
export default Feed;
