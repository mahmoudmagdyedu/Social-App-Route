import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../services/api";
import type { Collection } from "../types";

// الـ loader بيتبعت بـ useCallback؛ Cleanup يمنع رد طلب قديم من تغيير الصفحة الجديدة.
const useCollection = <T>(
  loader: (page: number, signal: AbortSignal) => Promise<Collection<T>>
) => {
  const [data, setData] = useState<Collection<T>>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await loader(page, controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (e) {
        if (!controller.signal.aborted) setError(errorMessage(e));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [loader, page, version]);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { ...data, setData, loading, error, page, setPage, refresh };
};
export default useCollection;
