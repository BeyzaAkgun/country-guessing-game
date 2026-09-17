// useAuth.ts - Auth state management
import { useState, useEffect, useCallback } from "react";
import {
  auth,
  users,
  setToken,
  clearToken,
  getToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  type StoredUser,
  type UserProfile,
} from "@/api/client";

export type AuthState = "loading" | "authenticated" | "unauthenticated";

export interface UseAuthReturn {
  user: StoredUser | null;
  profile: UserProfile | null;
  state: AuthState;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<StoredUser | null>(getStoredUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [state, setState]     = useState<AuthState>(
    getToken() ? "loading" : "unauthenticated"
  );
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount: verify stored token is still valid
  useEffect(() => {
    if (!getToken()) {
      setState("unauthenticated");
      return;
    }

    let cancelled = false;

    const restoreAuth = async () => {
      try {
        const me = await auth.me();
        const stored: StoredUser = { id: me.id, username: me.username, email: me.email };
        if (cancelled) return;
        setUser(stored);
        setStoredUser(stored);

        try {
          const profileData = await users.getProfile();
          if (!cancelled) setProfile(profileData);
        } catch {
          if (!cancelled) setProfile(null);
        }

        if (!cancelled) setState("authenticated");
      } catch {
        clearToken();
        clearStoredUser();
        setProfile(null);
        if (!cancelled) setState("unauthenticated");
      }
    };

    restoreAuth();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auth.login(email, password);
      setToken(res.access_token);
      const me = await auth.me();
      const stored: StoredUser = { id: me.id, username: me.username, email: me.email };
      setUser(stored);
      setStoredUser(stored);
      try {
        const profileData = await users.getProfile();
        setProfile(profileData);
      } catch {
        setProfile(null);
      }
      setState("authenticated");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auth.register(username, email, password);
      setToken(res.access_token);
      const me = await auth.me();
      const stored: StoredUser = { id: me.id, username: me.username, email: me.email };
      setUser(stored);
      setStoredUser(stored);
      try {
        const profileData = await users.getProfile();
        setProfile(profileData);
      } catch {
        setProfile(null);
      }
      setState("authenticated");
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();
    setUser(null);
    setProfile(null);
    setState("unauthenticated");
  }, []);

  return { user, profile, state, error, loading, login, register, logout };
}