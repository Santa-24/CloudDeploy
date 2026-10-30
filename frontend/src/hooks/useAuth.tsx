import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { apiClient } from '../services/apiClient';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  toggleDemoMode: (val?: boolean) => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(apiClient.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<boolean>(apiClient.isDemoMode());

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token || demoMode) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          if (demoMode && !token) {
            const demoToken = 'demo-jwt-token-clouddeploy-aws-cognito-simulated';
            apiClient.setToken(demoToken);
            setToken(demoToken);
          }
        }
      } catch (err) {
        console.warn('Initial session validation skipped or expired:', err);
        apiClient.setToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [demoMode]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const toggleDemoMode = (val?: boolean) => {
    const nextVal = typeof val === 'boolean' ? val : !demoMode;
    apiClient.setDemoMode(nextVal);
    setDemoModeState(nextVal);
    if (nextVal && !user) {
      authService.getCurrentUser().then(setUser);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const refreshed = await authService.getCurrentUser();
      setUser(refreshed);
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        demoMode,
        login,
        register,
        logout,
        toggleDemoMode,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
