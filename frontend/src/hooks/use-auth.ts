import { useEffect, useState, useCallback } from "react";
import { apiClient, tokenStore, type UserDto } from "@/lib/api-client";

export type Profile = UserDto;

export function useAuth() {
  const [user,    setUser]    = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }
    try {
      const me = await apiClient.auth.me();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function login(email: string, password: string) {
    const res = await apiClient.auth.login(email, password);
    tokenStore.set(res.token);
    setUser(res.user);
    return res;
  }

  async function register(data: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
    phoneNumber?: string;
  }) {
    const res = await apiClient.auth.register(data);
    tokenStore.set(res.token);
    setUser(res.user);
    return res;
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return {
    user,
    profile: user,
    isAdmin,
    loading,
    login,
    register,
    logout,
    reload: load,
    // compatibility shim
    session: user ? { user } : null,
  };
}
