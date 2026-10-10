import { getLoggedUser } from "../API/API";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import { ApiError, errorMessage, TOKEN_KEY } from "../API/API";
import type { AuthData, User } from "../types";

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_KEY))
  );
  const [error, setError] = useState("");
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setLoading(false);
    setError("");
  }, []);
  const setSession = useCallback((data: AuthData) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setLoading(false);
    setError("");
    getLoggedUser()
      .then((result) => {
        if (localStorage.getItem(TOKEN_KEY) === data.token)
          setUser(result.data.user);
      })
      .catch(() => {});
  }, []);
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const result = await getLoggedUser();
    if (token && localStorage.getItem(TOKEN_KEY) === token)
      setUser(result.data.user);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (localStorage.getItem(TOKEN_KEY)) {
      getLoggedUser(controller.signal)
        .then((result) => setUser(result.data.user))
        .catch((e) => {
          if (
            e.name !== "AbortError" &&
            !(e instanceof ApiError && e.status === 401)
          )
            setError(errorMessage(e));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }
    const onExpired = () => {
      logout();
      toast.error("الجلسة انتهت. سجّل دخولك من جديد.");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY) window.location.reload();
    };
    window.addEventListener("auth-expired", onExpired);
    window.addEventListener("storage", onStorage);
    return () => {
      controller.abort();
      window.removeEventListener("auth-expired", onExpired);
      window.removeEventListener("storage", onStorage);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, setSession, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export default AuthProvider;
