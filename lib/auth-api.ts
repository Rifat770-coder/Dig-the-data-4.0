// lib/auth-api.ts
import { databases, DATABASE_ID } from './appwrite';
import { ID } from 'appwrite';

// Collection ID for auth settings
export const AUTH_SETTINGS_COLLECTION_ID = 'auth-settings';

// Auth mode type
export type AuthMode = 'registration' | 'team-login';

// Interface for auth settings document
interface AuthSettings {
  $id: string;
  mode: AuthMode;
  updatedAt: string;
  updatedBy?: string;
}

// Default auth settings document ID
const AUTH_SETTINGS_DOC_ID = 'auth-mode-config';

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Rate limiting storage keys
const RATE_LIMIT_KEY = 'auth_rate_limit';
const LOCKOUT_KEY = 'auth_lockout';

// Validation constants
const TEAM_NAME_MIN_LENGTH = 3;
const TEAM_NAME_MAX_LENGTH = 50;
const TEAM_CODE_MIN_LENGTH = 4;
const TEAM_CODE_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;

// Error types
export class AuthValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'AuthValidationError';
  }
}

export class AuthNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthNetworkError';
  }
}

export class AuthPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthPermissionError';
  }
}

/**
 * Check if user is currently locked out due to too many failed attempts
 */
function isLockedOut(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lockoutData = localStorage.getItem(LOCKOUT_KEY);
  if (!lockoutData) return false;
  
  const { timestamp } = JSON.parse(lockoutData);
  const now = Date.now();
  
  if (now - timestamp > LOCKOUT_DURATION) {
    // Lockout period has expired
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(RATE_LIMIT_KEY);
    return false;
  }
  
  return true;
}

/**
 * Record a failed login attempt
 */
function recordFailedAttempt(): void {
  if (typeof window === 'undefined') return;
  
  const now = Date.now();
  const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
  
  let attempts = 1;
  if (rateLimitData) {
    const { count, firstAttempt } = JSON.parse(rateLimitData);
    // Reset counter if more than lockout duration has passed
    if (now - firstAttempt > LOCKOUT_DURATION) {
      attempts = 1;
    } else {
      attempts = count + 1;
    }
  }
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
    count: attempts,
    firstAttempt: rateLimitData ? JSON.parse(rateLimitData).firstAttempt : now,
    lastAttempt: now
  }));
  
  // Lock out user if max attempts reached
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
      timestamp: now
    }));
  }
}

/**
 * Clear failed login attempts on successful login
 */
function clearFailedAttempts(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(RATE_LIMIT_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

/**
 * Get remaining lockout time in minutes
 */
function getRemainingLockoutTime(): number {
  if (typeof window === 'undefined') return 0;
  
  const lockoutData = localStorage.getItem(LOCKOUT_KEY);
  if (!lockoutData) return 0;
  
  const { timestamp } = JSON.parse(lockoutData);
  const now = Date.now();
  const remaining = LOCKOUT_DURATION - (now - timestamp);
  
  return Math.ceil(remaining / (60 * 1000)); // Return minutes
}

/**
 * Validate authentication mode
 */
function validateAuthMode(mode: string): AuthMode {
  if (!mode || typeof mode !== 'string') {
    throw new AuthValidationError('Authentication mode is required and must be a string', 'mode');
  }
  
  if (mode !== 'registration' && mode !== 'team-login') {
    throw new AuthValidationError('Authentication mode must be either "registration" or "team-login"', 'mode');
  }
  
  return mode as AuthMode;
}

/**
 * Validate team login credentials
 */
function validateTeamCredentials(credentials: TeamLoginCredentials): void {
  // Validate team name
  if (!credentials.teamName || typeof credentials.teamName !== 'string') {
    throw new AuthValidationError('Team name is required', 'teamName');
  }
  
  const trimmedTeamName = credentials.teamName.trim();
  if (trimmedTeamName.length < TEAM_NAME_MIN_LENGTH) {
    throw new AuthValidationError(`Team name must be at least ${TEAM_NAME_MIN_LENGTH} characters long`, 'teamName');
  }
  
  if (trimmedTeamName.length > TEAM_NAME_MAX_LENGTH) {
    throw new AuthValidationError(`Team name must not exceed ${TEAM_NAME_MAX_LENGTH} characters`, 'teamName');
  }
  
  // Validate team code
  if (!credentials.teamCode || typeof credentials.teamCode !== 'string') {
    throw new AuthValidationError('Team code is required', 'teamCode');
  }
  
  const trimmedTeamCode = credentials.teamCode.trim();
  if (trimmedTeamCode.length < TEAM_CODE_MIN_LENGTH) {
    throw new AuthValidationError(`Team code must be at least ${TEAM_CODE_MIN_LENGTH} characters long`, 'teamCode');
  }
  
  if (trimmedTeamCode.length > TEAM_CODE_MAX_LENGTH) {
    throw new AuthValidationError(`Team code must not exceed ${TEAM_CODE_MAX_LENGTH} characters`, 'teamCode');
  }
  
  // Validate team code format (alphanumeric only)
  if (!/^[a-zA-Z0-9]+$/.test(trimmedTeamCode)) {
    throw new AuthValidationError('Team code must contain only letters and numbers', 'teamCode');
  }
  
  // Validate password
  if (!credentials.password || typeof credentials.password !== 'string') {
    throw new AuthValidationError('Password is required', 'password');
  }
  
  if (credentials.password.length < PASSWORD_MIN_LENGTH) {
    throw new AuthValidationError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`, 'password');
  }
}

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Get current authentication mode from backend (with localStorage fallback)
 */
export async function getAuthMode(): Promise<AuthMode> {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      AUTH_SETTINGS_COLLECTION_ID,
      AUTH_SETTINGS_DOC_ID
    );
    
    return (response as unknown as AuthSettings).mode || 'team-login';
  } catch (error) {
    console.error('Error fetching auth mode from Appwrite:', error);
    
    // Fallback to localStorage if Appwrite is not available
    try {
      const savedMode = localStorage.getItem('dig-the-data-auth-mode');
      if (savedMode && (savedMode === 'registration' || savedMode === 'team-login')) {
        return savedMode as AuthMode;
      }
    } catch (storageError) {
      console.error('localStorage fallback failed:', storageError);
    }
    
    // Return default mode if both Appwrite and localStorage fail
    return 'team-login';
  }
}

/**
 * Update authentication mode in backend (with localStorage fallback)
 */
export async function updateAuthMode(mode: AuthMode, updatedBy?: string): Promise<void> {
  try {
    // Validate input
    const validatedMode = validateAuthMode(mode);
    const sanitizedUpdatedBy = updatedBy ? sanitizeString(updatedBy) : undefined;
    
    const updateData = {
      mode: validatedMode,
      updatedAt: new Date().toISOString(),
      ...(sanitizedUpdatedBy && { updatedBy: sanitizedUpdatedBy })
    };

    try {
      // Try to update existing document
      await databases.updateDocument(
        DATABASE_ID,
        AUTH_SETTINGS_COLLECTION_ID,
        AUTH_SETTINGS_DOC_ID,
        updateData
      );
    } catch (updateError: any) {
      // If document doesn't exist, create it
      if (updateError?.code === 404) {
        await databases.createDocument(
          DATABASE_ID,
          AUTH_SETTINGS_COLLECTION_ID,
          AUTH_SETTINGS_DOC_ID,
          {
            $id: AUTH_SETTINGS_DOC_ID,
            ...updateData
          }
        );
      } else {
        throw updateError;
      }
    }
  } catch (error: any) {
    console.error('Error updating auth mode in Appwrite:', error);
    
    if (error instanceof AuthValidationError) {
      throw error;
    }
    
    // If Appwrite is not available or collection doesn't exist, use localStorage as fallback
    if (error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('Database')) {
      console.warn('Appwrite collection not available, using localStorage fallback');
      try {
        localStorage.setItem('dig-the-data-auth-mode', mode);
        return; // Success with localStorage fallback
      } catch (storageError) {
        console.error('localStorage fallback failed:', storageError);
        throw new AuthNetworkError('Failed to update authentication mode: both Appwrite and localStorage unavailable');
      }
    }
    
    if (error?.code === 401 || error?.code === 403) {
      throw new AuthPermissionError('Insufficient permissions to update authentication mode');
    }
    
    if (error?.code >= 500) {
      throw new AuthNetworkError('Server error occurred while updating authentication mode');
    }
    
    throw new AuthNetworkError('Failed to update authentication mode');
  }
}

/**
 * Initialize auth settings collection (for setup)
 */
export async function initializeAuthSettings(): Promise<void> {
  try {
    // Check if document exists
    await databases.getDocument(
      DATABASE_ID,
      AUTH_SETTINGS_COLLECTION_ID,
      AUTH_SETTINGS_DOC_ID
    );
  } catch (error) {
    // Document doesn't exist, create it with default settings
    try {
      await databases.createDocument(
        DATABASE_ID,
        AUTH_SETTINGS_COLLECTION_ID,
        AUTH_SETTINGS_DOC_ID,
        {
          $id: AUTH_SETTINGS_DOC_ID,
          mode: 'team-login' as AuthMode,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      );
    } catch (createError) {
      console.error('Error initializing auth settings:', createError);
      throw new Error('Failed to initialize authentication settings');
    }
  }
}

/**
 * Team login credentials interface
 */
export interface TeamLoginCredentials {
  teamName: string;
  teamCode: string;
  password: string;
}

/**
 * Validate team login credentials against Appwrite database (enhanced version)
 */
export async function validateTeamLogin(credentials: TeamLoginCredentials): Promise<boolean> {
  try {
    // Validate input format first
    validateTeamCredentials(credentials);
    
    // Sanitize inputs
    const sanitizedCredentials = {
      teamName: sanitizeString(credentials.teamName),
      teamCode: sanitizeString(credentials.teamCode),
      password: credentials.password // Don't sanitize password as it might contain special chars
    };
    
    // Query Appwrite database for teams collection
    try {
      const { Query } = await import('appwrite');
      const { TEAMS_COLLECTION_ID } = await import('./appwrite');
      
      // Search for team by team code (case-insensitive)
      const response = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [
          Query.equal('teamCode', [sanitizedCredentials.teamCode.toUpperCase()])
        ]
      );
      
      if (response.documents.length === 0) {
        // Team not found
        return false;
      }
      
      const team = response.documents[0] as any;
      
      // Verify team name matches (case-insensitive)
      const teamNameMatch = team.teamName.toLowerCase().trim() === sanitizedCredentials.teamName.toLowerCase().trim();
      
      // Verify password matches
      const passwordMatch = team.password === sanitizedCredentials.password;
      
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      return teamNameMatch && passwordMatch;
      
    } catch (dbError: any) {
      // If teams collection doesn't exist yet, log warning and return false
      if (dbError?.code === 404 || dbError?.message?.includes('Collection')) {
        console.warn('Teams collection not found in Appwrite. Please create the collection first.');
        console.warn('Collection ID should be: teams');
        console.warn('Required attributes: teamName (string), teamCode (string), password (string)');
        return false;
      }
      
      throw dbError;
    }
    
  } catch (error) {
    if (error instanceof AuthValidationError) {
      throw error;
    }
    console.error('Error validating team login:', error);
    throw new AuthNetworkError('Failed to validate team credentials due to a system error');
  }
}

/**
 * Create team login session
 */
export async function createTeamSession(credentials: TeamLoginCredentials): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    // Input validation
    if (!credentials) {
      throw new AuthValidationError('Login credentials are required');
    }

    // Check if user is locked out
    if (isLockedOut()) {
      const remainingTime = getRemainingLockoutTime();
      return {
        success: false,
        error: `Too many failed attempts. Please try again in ${remainingTime} minutes.`
      };
    }

    // Validate credentials format first (this will throw AuthValidationError if invalid)
    validateTeamCredentials(credentials);

    // Validate credentials against known teams
    const isValid = await validateTeamLogin(credentials);
    
    if (!isValid) {
      recordFailedAttempt();
      const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
      const attempts = rateLimitData ? JSON.parse(rateLimitData).count : 1;
      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      
      if (remaining > 0) {
        return {
          success: false,
          error: `Invalid team credentials. ${remaining} attempts remaining.`
        };
      } else {
        return {
          success: false,
          error: `Too many failed attempts. Account locked for ${Math.ceil(LOCKOUT_DURATION / (60 * 1000))} minutes.`
        };
      }
    }
    
    // Clear failed attempts on successful login
    clearFailedAttempts();
    
    // Generate session ID
    const sessionId = ID.unique();
    const loginTime = new Date().toISOString();
    
    // Sanitize data before storing
    const sessionData = {
      sessionId,
      teamName: sanitizeString(credentials.teamName),
      teamCode: sanitizeString(credentials.teamCode),
      loginTime,
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
      isValid: true
    };
    
    // Store session in localStorage with error handling
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('teamSession', JSON.stringify(sessionData));
      }
    } catch (storageError) {
      console.error('Failed to store session data:', storageError);
      // Continue with login success even if localStorage fails
    }
    
    return { 
      success: true, 
      sessionId 
    };
  } catch (error) {
    console.error('Error creating team session:', error);
    
    if (error instanceof AuthValidationError) {
      recordFailedAttempt();
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    if (error instanceof AuthNetworkError) {
      return { 
        success: false, 
        error: 'Network error occurred. Please check your connection and try again.' 
      };
    }
    
    // Generic error handling
    return { 
      success: false, 
      error: 'An unexpected error occurred during login. Please try again.' 
    };
  }
}

/**
 * Get current team session
 */
export function getTeamSession(): { sessionId: string; teamName: string; teamCode: string; loginTime: string; expiresAt: string } | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const session = localStorage.getItem('teamSession');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    
    // Check if session has expired
    if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      clearTeamSession();
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error getting team session:', error);
    clearTeamSession(); // Clear corrupted session data
    return null;
  }
}

/**
 * Check if user has a valid team session
 */
export function isTeamSessionValid(): boolean {
  const session = getTeamSession();
  return session !== null;
}

/**
 * Clear team session
 */
export function clearTeamSession(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('teamSession');
  } catch (error) {
    console.error('Error clearing team session:', error);
  }
}