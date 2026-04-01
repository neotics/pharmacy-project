import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import * as authService from "../services/authService";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredSession());
  const [initializing, setInitializing] = useState(
    Boolean(getStoredSession()?.token)
  );

  useEffect(() => {
    const existingSession = getStoredSession();

    if (!existingSession?.token) {
      setInitializing(false);
      return undefined;
    }

    let ignore = false;

    authService
      .getMe()
      .then((response) => {
        if (ignore) {
          return;
        }

        const nextSession = {
          token: existingSession.token,
          user: response.user,
        };

        setStoredSession(nextSession);
        setSession(nextSession);
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        clearStoredSession();
        setSession(null);
      })
      .finally(() => {
        if (!ignore) {
          setInitializing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveSession = (payload) => {
    const nextSession = {
      token: payload.token,
      user: payload.user,
    };

    setStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const login = async (payload) => {
    const response = await authService.login(payload);
    return saveSession(response);
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    return saveSession(response);
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  const value = {
    session,
    user: session?.user ?? null,
    initializing,
    isAuthenticated: Boolean(session?.token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
