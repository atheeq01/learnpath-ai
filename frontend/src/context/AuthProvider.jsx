import { useEffect, useState } from "react";

import api from "../lib/api";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(sessionStorage.getItem("token"))
  );

  // Restore login when page refreshes
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) return;

    let ignore = false;

    api.get("/auth/me")
      .then(({ data }) => {
        if (!ignore) setUser(data.user);
      })
      .catch(() => {
        if (!ignore) {
          sessionStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Login
  const login = async (credentials) => {
    const { data } = await api.post(
      "/auth/login",
      credentials
    );

    sessionStorage.setItem("token", data.token);
    setUser(data.user);

    return data.user;
  };

  // Registration
  const register = async (userData) => {
    const { data } = await api.post(
      "/auth/register",
      userData
    );

    return data;
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}