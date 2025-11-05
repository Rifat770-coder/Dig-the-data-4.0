'use client';

import { useState } from 'react';
import { useAuthMode, AuthMode } from '@/lib/auth-context';
import { updateAuthMode } from '@/lib/auth-api';

interface AuthModeToggleProps {
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onModeChange?: (mode: AuthMode) => void;
}

export default function AuthModeToggle({ 
  showLabels = true, 
  size = 'md', 
  disabled = false,
  onModeChange 
}: AuthModeToggleProps) {
  const { authMode, setAuthMode } = useAuthMode();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (disabled || isUpdating) return;

    const newMode: AuthMode = authMode === 'registration' ? 'team-login' : 'registration';
    
    setIsUpdating(true);
    setError(null);

    try {
      // Update backend
      await updateAuthMode(newMode, 'admin');
      
      // Update local state
      setAuthMode(newMode);
      
      // Call callback if provided
      onModeChange?.(newMode);
    } catch (err) {
      console.error('Error updating auth mode:', err);
      setError('Failed to update authentication mode');
    } finally {
      setIsUpdating(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-6',
      toggle: 'w-4 h-4',
      translate: 'translate-x-6',
      text: 'text-xs'
    },
    md: {
      container: 'w-16 h-8',
      toggle: 'w-6 h-6',
      translate: 'translate-x-8',
      text: 'text-sm'
    },
    lg: {
      container: 'w-20 h-10',
      toggle: 'w-8 h-8',
      translate: 'translate-x-10',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];
  const isRegistrationMode = authMode === 'registration';

  return (
    <div className="flex flex-col items-center gap-3">
      {showLabels && (
        <div className="flex items-center justify-between w-full max-w-xs">
          <span className={`${config.text} font-medium ${
            isRegistrationMode ? 'text-cyan-400' : 'text-gray-400'
          } transition-colors`}>
            Registration
          </span>
          <span className={`${config.text} font-medium ${
            !isRegistrationMode ? 'text-blue-400' : 'text-gray-400'
          } transition-colors`}>
            Team Login
          </span>
        </div>
      )}

      <div className="relative">
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={disabled || isUpdating}
          className={`
            relative ${config.container} rounded-full p-1 transition-all duration-300 ease-in-out
            ${isRegistrationMode 
              ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }
            ${disabled || isUpdating 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:shadow-lg hover:scale-105 cursor-pointer'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            ${isRegistrationMode ? 'focus:ring-cyan-500' : 'focus:ring-blue-500'}
          `}
          aria-label={`Switch to ${isRegistrationMode ? 'team login' : 'registration'} mode`}
        >
          {/* Toggle Circle */}
          <div
            className={`
              ${config.toggle} bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out
              flex items-center justify-center
              ${isRegistrationMode ? '' : config.translate}
            `}
          >
            {/* Loading Spinner */}
            {isUpdating && (
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            )}
            
            {/* Mode Icons */}
            {!isUpdating && (
              <>
                {isRegistrationMode ? (
                  <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </>
            )}
          </div>
        </button>

        {/* Status Indicator */}
        <div className={`
          absolute -bottom-8 left-1/2 transform -translate-x-1/2 
          ${config.text} font-medium text-center whitespace-nowrap
          ${isRegistrationMode ? 'text-cyan-400' : 'text-blue-400'}
        `}>
          {isUpdating ? 'Updating...' : (isRegistrationMode ? 'Registration Mode' : 'Team Login Mode')}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-xs text-center">{error}</p>
        </div>
      )}

      {/* Mode Description */}
      {showLabels && (
        <div className="mt-6 p-3 bg-gray-800/50 border border-gray-700 rounded-lg max-w-sm">
          <p className={`${config.text} text-gray-300 text-center`}>
            {isRegistrationMode 
              ? 'Individual users can register with personal details and payment confirmation.'
              : 'Teams can login using team credentials for collaborative access.'
            }
          </p>
        </div>
      )}
    </div>
  );
}