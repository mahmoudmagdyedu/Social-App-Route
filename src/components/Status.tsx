import Icon from "./Icon";
import type { Pagination } from "../types";
export function Skeleton() {
  return (
  <div className="space-y-4" role="status" aria-label="جاري التحميل">
    {[1, 2, 3].map((n) => (
      <div className="card p-6 animate-pulse" key={n}>
        <div className="flex gap-3">
          <div className="size-11 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-slate-100" />
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 h-3 w-full rounded bg-slate-100" />
        <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
        <div className="mt-5 h-36 rounded-xl bg-slate-100" />
      </div>
    ))}
  </div>
);
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
  <div className="card empty-state" role="alert">
    <span className="empty-icon">
      <Icon name="globe" />
    </span>
    <h2>حصلت مشكلة بسيطة</h2>
    <p>{message}</p>
    {retry && (
      <button className="btn-primary" onClick={retry}>
        جرّب تاني
      </button>
    )}
  </div>
);
}
export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
  <div className="card empty-state">
    <span className="empty-icon">
      <Icon name="spark" />
    </span>
    <h2>{title}</h2>
    <p>{text}</p>
  </div>
);
}
export function PaginationControls({
  pagination,
  page,
  setPage,
}: {
  pagination?: Pagination;
  page: number;
  setPage: (page: number) => void;
}) {
  return pagination && pagination.numberOfPages > 1 ? (
    <nav className="pagination" aria-label="صفحات النتائج">
      <button
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        السابق
      </button>
      <span>
        صفحة {page} من {pagination.numberOfPages}
      </span>
      <button
        className="btn-secondary"
        disabled={page >= pagination.numberOfPages}
        onClick={() => setPage(page + 1)}
      >
        التالي
      </button>
    </nav>
  ) : null;
}
