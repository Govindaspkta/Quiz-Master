import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  role: null,
  setRole: () => {},
});

// Helper functions for storage
const getStoredValue = async (key: string): Promise<string | null> => {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key });
    return value;
  } else {
    return localStorage.getItem(key);
  }
};

const setStoredValue = async (key: string, value: string): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
};

const removeStoredValue = async (key: string): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [role, setRoleState] = useState<string | null>(null);

  // Initialize from storage when component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await getStoredValue('token');
        const storedRole = await getStoredValue('role');
        
        if (storedToken) {
          setTokenState(storedToken);
        }
        if (storedRole) {
          setRoleState(storedRole);
        }
      } catch (error) {
        console.error('Error initializing auth from storage:', error);
      }
    };

    initializeAuth();
  }, []);

  // Custom setToken function that handles storage
  const setToken = async (newToken: string | null) => {
    try {
      setTokenState(newToken);
      
      if (newToken) {
        await setStoredValue('token', newToken);
      } else {
        await removeStoredValue('token');
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  };

  // Custom setRole function that handles storage
  const setRole = async (newRole: string | null) => {
    try {
      setRoleState(newRole);
      
      if (newRole) {
        await setStoredValue('role', newRole);
      } else {
        await removeStoredValue('role');
      }
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};