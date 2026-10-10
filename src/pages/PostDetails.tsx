import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { postService } from "../services/social";
import useResource from "../hooks/useResource";
import PostCard from "../components/PostCard";
import Icon from "../components/Icon";
import { ErrorState, Skeleton } from "../components/Status";
const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const loader = useCallback(
    (signal: AbortSignal) => postService.one(postId!, signal),
    [postId]
  );
  const post = useResource(loader);
  return (
    <>
      <Link to="/" className="back-link">
        <Icon name="arrow" className="rotate-180 size-4" />
        رجوع للحكايات
      </Link>
      <h1 className="section-title">الحكاية كاملة</h1>
      {post.loading ? (
        <Skeleton />
      ) : post.error || !post.data ? (
        <ErrorState
          message={post.error || "المنشور مش موجود"}
          retry={post.refresh}
        />
      ) : (
        <PostCard
          key={post.data.data.post._id}
          post={post.data.data.post}
          expanded
          onDeleted={() => navigate("/")}
        />
      )}
    </>
  );
};
export default PostDetails;
