import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTeamSession, AuthValidationError, AuthNetworkError } from '@/lib/auth-api';

interface TeamLoginProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function TeamLogin({ onSuccess, onError }: TeamLoginProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamName: '',
    teamCode: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate team name
    const trimmedTeamName = formData.teamName.trim();
    if (!trimmedTeamName) {
      newErrors.teamName = 'Team name is required';
    } else if (trimmedTeamName.length < 3) {
      newErrors.teamName = 'Team name must be at least 3 characters long';
    } else if (trimmedTeamName.length > 50) {
      newErrors.teamName = 'Team name must not exceed 50 characters';
    }
    
    // Validate team code
    const trimmedTeamCode = formData.teamCode.trim();
    if (!trimmedTeamCode) {
      newErrors.teamCode = 'Team code is required';
    } else if (trimmedTeamCode.length < 4) {
      newErrors.teamCode = 'Team code must be at least 4 characters long';
    } else if (trimmedTeamCode.length > 20) {
      newErrors.teamCode = 'Team code must not exceed 20 characters';
    } else if (!/^[a-zA-Z0-9]+$/.test(trimmedTeamCode)) {
      newErrors.teamCode = 'Team code must contain only letters and numbers';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    setMessage(null);
    
    try {
      // Trim whitespace from inputs before sending
      const trimmedCredentials = {
        teamName: formData.teamName.trim(),
        teamCode: formData.teamCode.trim(),
        password: formData.password
      };

      const result = await createTeamSession(trimmedCredentials);
      
      if (result.success) {
        const successMessage = `Welcome, ${trimmedCredentials.teamName}! Team login successful.`;
        setMessage({ type: 'success', text: successMessage });
        onSuccess?.(successMessage);
        
        // Small delay to show success state before navigation
        setTimeout(() => {
          router.push('/team-dashboard');
        }, 1500);
      } else {
        const errorMessage = result.error || 'Login failed. Please check your credentials and try again.';
        setMessage({ type: 'error', text: errorMessage });
        onError?.(errorMessage);
        
        // Focus on the password field for better UX
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
          passwordInput.focus();
        }
      }
    } catch (error) {
      console.error('Team login error:', error);
      
      if (error instanceof AuthValidationError) {
        if (error.field) {
          setErrors({ [error.field]: error.message });
          setMessage({ type: 'error', text: error.message });
          
          // Focus on the field with error
          const errorField = document.getElementById(error.field);
          if (errorField) {
            errorField.focus();
          }
        } else {
          setMessage({ type: 'error', text: error.message });
          onError?.(error.message);
        }
      } else if (error instanceof AuthNetworkError) {
        setMessage({ type: 'error', text: error.message });
        onError?.(error.message);
      } else {
        const errorText = 'An unexpected error occurred. Please check your internet connection and try again.';
        setMessage({ type: 'error', text: errorText });
        onError?.(errorText);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Team Login
          </h2>
          <p className="text-gray-400 mt-2">
            Access your team dashboard with your credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name Field */}
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                errors.teamName ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your team name"
              required
              disabled={loading}
            />
            {errors.teamName && (
              <p className="text-red-400 text-sm mt-1">{errors.teamName}</p>
            )}
          </div>

          {/* Team Code Field */}
          <div>
            <label htmlFor="teamCode" className="block text-sm font-medium text-gray-300 mb-2">
              Team Code
            </label>
            <input
              type="text"
              id="teamCode"
              name="teamCode"
              value={formData.teamCode}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                errors.teamCode ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your team code"
              required
              disabled={loading}
            />
            {errors.teamCode && (
              <p className="text-red-400 text-sm mt-1">{errors.teamCode}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.05 7.05M9.878 9.878a3 3 0 105.243 5.243m0 0L17.121 17.121M14.121 14.121L17.05 17.05" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Message Display - Success or Error */}
          {message && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{message.type === 'success' ? 'Success!' : 'Error'}</p>
                <p className="text-sm mt-1">{message.text}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            aria-describedby={loading ? "login-status" : undefined}
          >
            {loading ? (
              <div className="flex items-center justify-center" id="login-status" aria-live="polite">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login to Team'
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact your team administrator for access credentials.
          </p>
        </div>
      </div>
    </div>
  );
}