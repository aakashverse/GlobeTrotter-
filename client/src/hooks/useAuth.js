import { useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session from backend
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/status`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthReady(true);
      }
    };

    restoreSession();
  }, []);

  const login = (user) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try{
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally{
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isAuthenticated,
    authReady,
    login,
    logout,
  };
}
