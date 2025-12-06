"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated, removeToken, removeUser, setToken, setUser as setLocalStorageUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state from local storage
    const initAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUserState(getUser());
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    setToken(token);
    setLocalStorageUser(userData);
    setUserState(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
    setIsLoggedIn(false);
    router.push('/login');
  };

  const updateUser = (userData) => {
    setLocalStorageUser(userData);
    setUserState(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
