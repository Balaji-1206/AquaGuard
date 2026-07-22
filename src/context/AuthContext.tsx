import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { mockApi } from '../services/mockApi';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, pass?: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cachedUser = await StorageService.getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }
      } catch (err) {
        console.error('Failed restoring auth user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = async (u: UserProfile) => {
    setUser(u);
    await StorageService.saveUser(u);
  };

  const login = async (email?: string, pass?: string) => {
    setIsLoading(true);
    try {
      const u = await mockApi.login(email, pass);
      await handleLoginSuccess(u);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometrics = async () => {
    setIsLoading(true);
    try {
      const u = await mockApi.loginWithBiometrics();
      await handleLoginSuccess(u);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const u = await mockApi.loginWithGoogle();
      await handleLoginSuccess(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await StorageService.clearUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithBiometrics,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
