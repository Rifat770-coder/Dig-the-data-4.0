'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Authentication modes
export type AuthMode = 'registration' | 'team-login';

// Context interface
interface AuthModeContextType {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  refreshAuthMode: () => Promise<void>;
  isLoading: boolean;
}

// Create context
const AuthModeContext = createContext<AuthModeContextType | undefined>(undefined);

// Storage key for persistence
const AUTH_MODE_STORAGE_KEY = 'dig-the-data-auth-mode';

// Provider component
interface AuthModeProviderProps {
  children: ReactNode;
}

export function AuthModeProvider({ children }: AuthModeProviderProps) {
  const [authMode, setAuthModeState] = useState<AuthMode>('registration');
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch auth mode from Appwrite
  const refreshAuthMode = async () => {
    try {
      setIsLoading(true);
      const { getAuthMode } = await import('@/lib/auth-api');
      const mode = await getAuthMode();
      setAuthModeState(mode);
      localStorage.setItem(AUTH_MODE_STORAGE_KEY, mode);
      console.log('[AuthContext] ✅ Refreshed auth mode from Appwrite:', mode);
    } catch (error) {
      console.error('[AuthContext] Error fetching auth mode from Appwrite:', error);
      // Fallback to localStorage if fetch fails
      try {
        const savedMode = localStorage.getItem(AUTH_MODE_STORAGE_KEY);
        if (savedMode && (savedMode === 'registration' || savedMode === 'team-login')) {
          setAuthModeState(savedMode as AuthMode);
        }
      } catch {
        // noop
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load auth mode from Appwrite on mount (with localStorage fallback)
  useEffect(() => {
    refreshAuthMode();
  }, []);

  // Function to update auth mode and persist to localStorage
  const setAuthMode = (mode: AuthMode) => {
    try {
      setAuthModeState(mode);
      localStorage.setItem(AUTH_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving auth mode to localStorage:', error);
    }
  };

  const value: AuthModeContextType = {
    authMode,
    setAuthMode,
    refreshAuthMode,
    isLoading,
  };

  return (
    <AuthModeContext.Provider value={value}>
      {children}
    </AuthModeContext.Provider>
  );
}

// Custom hook to use auth mode context
export function useAuthMode() {
  const context = useContext(AuthModeContext);
  if (context === undefined) {
    throw new Error('useAuthMode must be used within an AuthModeProvider');
  }
  return context;
}

// Hook for checking if registration is enabled
export function useIsRegistrationEnabled() {
  const { authMode } = useAuthMode();
  return authMode === 'registration';
}

// Hook for checking if team login is enabled
export function useIsTeamLoginEnabled() {
  const { authMode } = useAuthMode();
  return authMode === 'team-login';
}