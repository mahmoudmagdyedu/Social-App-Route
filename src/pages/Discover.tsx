import { useCallback, useState } from "react";
import { userService } from "../services/social";
import useCollection from "../hooks/useCollection";
import UserCard from "../components/UserCard";
import Icon from "../components/Icon";
import {
  EmptyState,
  ErrorState,
  PaginationControls,
  Skeleton,
} from "../components/Status";
const Discover = () => {
  const [query, setQuery] = useState("");
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      userService.suggestions(page, signal),
    []
  );
  const list = useCollection(loader);
  const users = list.items.filter((u) =>
    `${u.name} ${u.username}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">كل معرفة جديدة، بداية حكاية</span>
          <h1>وسّع دايرتك</h1>
          <p>ناس جديدة، اهتمامات مختلفة، وحوارات تستاهل.</p>
        </div>
        <span className="heading-icon">
          <Icon name="users" />
        </span>
      </header>
      <div className="card p-4 mb-5">
        <label
          htmlFor="people-search"
          className="text-xs text-slate-500 block mb-2"
        >
          ابحث في الاقتراحات المعروضة
        </label>
        <input
          id="people-search"
          className="input"
          placeholder="اسم أو اسم مستخدم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {list.loading ? (
        <Skeleton />
      ) : list.error ? (
        <ErrorState message={list.error} retry={list.refresh} />
      ) : (
        <>
          {users.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {users.map((u) => (
                <UserCard key={u._id} user={u} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="مفيش نتيجة هنا"
              text="جرّب اسم تاني أو انتقل للصفحة التالية من الاقتراحات."
            />
          )}
          <PaginationControls
            pagination={list.pagination}
            page={list.page}
            setPage={(page) => {
              setQuery("");
              list.setPage(page);
            }}
          />
        </>
      )}
    </>
  );
};
export default Discover;
