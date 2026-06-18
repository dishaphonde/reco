import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { getToken, setToken as setLocalToken, removeToken } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any;
  login: (token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/v1/profile/me');
      setProfile(res.data);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error("Failed to fetch profile", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // Validate token by fetching profile
      const ok = await fetchProfile();
      setIsAuthenticated(!!ok);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    setLocalToken(token);
    const ok = await fetchProfile();
    setIsAuthenticated(!!ok);
    setIsLoading(false);
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, profile, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
