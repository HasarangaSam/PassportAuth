import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  logoutAllDevices as logoutAllDevicesRequest,
  changePassword as changePasswordRequest,
  refreshAccessToken,
} from "../api/auth.api.js";

import { setAccessToken as setStoredAccessToken } from "../auth-token.js";

import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth.types.js";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  setAuthentication: (accessToken: string, user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setStoredAccessToken(token);
  }, []);

  const setAuthentication = useCallback(
    (token: string, authenticatedUser: User) => {
      setAccessToken(token);
      setUser(authenticatedUser);
    },
    [setAccessToken],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      setIsLoading(true);

      try {
        const response = await loginRequest(input);

        setAccessToken(response.accessToken);
        setUser(response.user);
      } finally {
        setIsLoading(false);
      }
    },
    [setAccessToken],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setIsLoading(true);

      try {
        const response = await registerRequest(input);

        setAccessToken(response.accessToken);
        setUser(response.user);
      } finally {
        setIsLoading(false);
      }
    },
    [setAccessToken],
  );

  const refresh = useCallback(async () => {
    const response = await refreshAccessToken();

    setAccessToken(response.accessToken);
    setUser(response.user);
  }, [setAccessToken]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [setAccessToken]);

  const logoutAllDevices = useCallback(async () => {
    try {
      await logoutAllDevicesRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [setAccessToken]);

  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      await changePasswordRequest(input);

      setAccessToken(null);
      setUser(null);
    },
    [setAccessToken],
  );

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const response = await refreshAccessToken();

        if (!mounted) {
          return;
        }

        setAccessToken(response.accessToken);
        setUser(response.user);
      } catch {
        if (!mounted) {
          return;
        }

        setAccessToken(null);
        setUser(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setAccessToken]);

  const isAuthenticated = accessToken !== null && user !== null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      refresh,
      logout,
      logoutAllDevices,
      changePassword,
      setAuthentication,
    }),
    [
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      refresh,
      logout,
      logoutAllDevices,
      changePassword,
      setAuthentication,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
