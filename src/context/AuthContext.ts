import { createContext, useContext } from "react";
import type { AuthData, User } from "../types";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
  setSession: (data: AuthData) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
export const AuthContext = createContext<AuthState | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
