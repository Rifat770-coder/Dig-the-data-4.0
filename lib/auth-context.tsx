'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Authentication modes
export type AuthMode = 'registration' | 'team-login';

// Context interface
interface AuthModeContextType {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
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

  // Load auth mode from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(AUTH_MODE_STORAGE_KEY);
      if (savedMode && (savedMode === 'registration' || savedMode === 'team-login')) {
        setAuthModeState(savedMode as AuthMode);
      }
    } catch (error) {
      console.error('Error loading auth mode from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
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