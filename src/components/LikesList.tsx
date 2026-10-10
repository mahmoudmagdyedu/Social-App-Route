import { getPostLikes } from "../API/API";
import { useCallback } from "react";
import useCollection from "../hooks/useCollection";
import UserCard from "./UserCard";
import { EmptyState, ErrorState, PaginationControls } from "./Status";
function LikesList({ postId }: { postId: string }) {
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      getPostLikes(postId, page, signal),
    [postId]
  );
  const list = useCollection(loader);
  return list.loading ? (
    <p role="status">جاري التحميل...</p>
  ) : list.error ? (
    <ErrorState message={list.error} retry={list.refresh} />
  ) : (
    <>
      {list.items.length === 0 && (
        <EmptyState title="لسه مفيش إعجابات" text="التفاعل بيبدأ بلمسة." />
      )}
      {list.items.map((u) => (
        <UserCard key={u._id} user={u} compact />
      ))}
      <PaginationControls
        pagination={list.pagination}
        page={list.page}
        setPage={list.setPage}
      />
    </>
  );
}
export default LikesList;
