import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { postService, userService } from "../services/social";
import { errorMessage } from "../services/api";
import useCollection from "../hooks/useCollection";
import useResource from "../hooks/useResource";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import PostCard from "../components/PostCard";
import Composer from "../components/Composer";
import {
  EmptyState,
  ErrorState,
  PaginationControls,
  Skeleton,
} from "../components/Status";
const Profile = () => {
  const { user: me, refreshUser } = useAuth();
  const { userId } = useParams();
  const target = userId || me!._id;
  const own = target === me?._id;
  const [busy, setBusy] = useState(false);
  const profileLoader = useCallback(
    (signal: AbortSignal) => userService.profile(target, signal),
    [target]
  );
  const profile = useResource(profileLoader);
  const postsLoader = useCallback(
    (page: number, signal: AbortSignal) =>
      postService.userPosts(target, page, signal),
    [target]
  );
  const posts = useCollection(postsLoader);
  const user = profile.data?.data.user;
  const following = profile.data?.data.isFollowing || false;
  const follow = async () => {
    setBusy(true);
    try {
      await userService.follow(target);
      profile.refresh();
      await refreshUser();
      toast.success(following ? "تم إلغاء المتابعة" : "دايرتك كبرت بحد جديد");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  if (profile.loading) return <Skeleton />;
  if (profile.error || !user)
    return (
      <ErrorState
        message={profile.error || "المستخدم مش موجود"}
        retry={profile.refresh}
      />
    );
  return (
    <>
      <section className="card profile-card">
        <div className="profile-cover">
          {user.cover ? (
            <img src={user.cover} alt="غلاف الملف الشخصي" />
          ) : (
            <>
              <div className="cover-circle" />
              <span>كل حكاية ليها صاحب.</span>
              <Icon name="spark" className="size-10" />
            </>
          )}
        </div>
        <div className="profile-info">
          <Avatar user={user} size="lg" />
          <div className="profile-actions">
            {own ? (
              <Link to="/settings" className="btn-secondary">
                <Icon name="edit" className="size-4" />
                إعدادات الحساب
              </Link>
            ) : (
              <button
                className={following ? "btn-secondary" : "btn-primary"}
                disabled={busy}
                onClick={follow}
              >
                <Icon name={following ? "check" : "plus"} />
                {following ? "إلغاء المتابعة" : "متابعة"}
              </button>
            )}
          </div>
          <h1>{user.name}</h1>
          <p className="text-sm text-slate-400 mt-1" dir="ltr">
            @{user.username}
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {own
              ? "دي مساحتك. خلي حكايتك تتكلم عنك."
              : "كل منشور بيحكي جزء من الحكاية."}
          </p>
          <div className="profile-stats">
            <span>
              <strong>{user.followersCount || 0}</strong> متابع
            </span>
            <span>
              <strong>{user.followingCount || 0}</strong> بيتابعهم
            </span>
            <span>
              <strong>{posts.pagination?.total || 0}</strong> منشور
            </span>
          </div>
        </div>
      </section>
      {own && (
        <div className="mt-5">
          <Composer
            onCreated={() => {
              posts.setPage(1);
              posts.refresh();
            }}
          />
        </div>
      )}
      <h2 className="section-title">
        {own ? "حكاياتك" : `منشورات ${user.name.split(" ")[0]}`}
      </h2>
      {posts.loading ? (
        <Skeleton />
      ) : posts.error ? (
        <ErrorState message={posts.error} retry={posts.refresh} />
      ) : (
        <>
          <div className="space-y-5">
            {posts.items.length ? (
              posts.items.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={(id) =>
                    posts.setData((prev) => ({
                      ...prev,
                      items: prev.items.filter((item) => item._id !== id),
                      pagination: prev.pagination
                        ? {
                            ...prev.pagination,
                            total: Math.max(0, prev.pagination.total - 1),
                          }
                        : undefined,
                    }))
                  }
                  onShared={posts.refresh}
                />
              ))
            ) : (
              <EmptyState
                title="الحكاية لسه في أولها"
                text={
                  own
                    ? "شارك أول منشور ليك وخلي دايرتك تعرفك أكتر."
                    : "لسه مفيش منشورات للمستخدم ده."
                }
              />
            )}
          </div>
          <PaginationControls
            pagination={posts.pagination}
            page={posts.page}
            setPage={posts.setPage}
          />
        </>
      )}
    </>
  );
};
export default Profile;
