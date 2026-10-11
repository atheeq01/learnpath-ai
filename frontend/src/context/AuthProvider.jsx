import { useEffect, useState } from "react";
import api from "../services/api";
import { getApiError } from "../services/apiError";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(sessionStorage.getItem("token")),
  );
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    // Expired sessions should also clear the React user, not just the token.
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const token = sessionStorage.getItem("token");
        if (
          error.response?.status === 401 &&
          token &&
          error.config?.headers?.Authorization === `Bearer ${token}` &&
          error.config?.url !== "/auth/login"
        ) {
          sessionStorage.removeItem("token");
          setUser(null);
        }
        return Promise.reject(error);
      },
    );

    async function restoreSession() {
      try {
        const { data } = await api.get("/auth/me", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setUser(data.user);
      } catch (error) {
        if (!controller.signal.aborted && error.response?.status !== 401) {
          // Keep the token when a temporary network problem prevents restoration.
          setAuthError(getApiError(error));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (sessionStorage.getItem("token")) restoreSession();
    return () => {
      controller.abort();
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  async function login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    sessionStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(userData) {
    const { data } = await api.post("/auth/register", userData);
    return data;
  }

  function logout() {
    sessionStorage.removeItem("token");
    setUser(null);
    setAuthError("");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
