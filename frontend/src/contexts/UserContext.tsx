import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/api/client';
import type { UserInfo } from '@/types';

interface UserContextType {
  user: UserInfo | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      const storedUser = localStorage.getItem('pos_user');
      const token = localStorage.getItem('pos_token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('pos_user');
          localStorage.removeItem('pos_token');
        }
      }
      setIsLoading(false);
    };

    initializeUser();

    // Listen for storage changes to update user data when login occurs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pos_user' || e.key === 'pos_token') {
        initializeUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events that might indicate login/logout
    const handleLogin = () => initializeUser();
    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('userLogout', handleLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('userLogout', handleLogin);
    };
  }, []);

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}