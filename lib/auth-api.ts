// lib/auth-api.ts
import { databases, DATABASE_ID, TEAM_MODE_COLLECTION_ID, safeAppwrite } from '@/lib/appwrite';
import { ID } from 'appwrite';

// Collection ID for auth settings
export const AUTH_SETTINGS_COLLECTION_ID = 'auth-settings';

// Team-Mode collection ID for mode option (boolean)
// NOTE: TEAM_MODE_COLLECTION_ID is imported from '@/lib/appwrite' to avoid duplicate declarations.

// Auth mode type
export type AuthMode = 'registration' | 'team-login';

// Interface for auth settings document (kept for compatibility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AuthSettings {
  $id: string;
  mode: AuthMode;
  updatedAt: string;
  updatedBy?: string;
}

// Interface for Team-Mode document (stores mode as boolean)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TeamModeSettings {
  $id: string;
  mode: boolean; // true = registration mode, false = team-login mode
  $createdAt: string;
  $updatedAt: string;
}

// Default auth settings document ID
const AUTH_SETTINGS_DOC_ID = 'auth-mode-config';

// Default Team-Mode document ID (using the collection ID as document ID)
// No separate TEAM_MODE_DOC_ID constant needed because TEAM_MODE_COLLECTION_ID is used as the document ID.

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

// Interface for rate limit data
interface RateLimitData {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// Interface for lockout data
interface LockoutData {
  timestamp: number;
}

/**
 * Check if user is currently locked out due to too many failed attempts
 */
function isLockedOut(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lockoutData = localStorage.getItem(LOCKOUT_KEY);
  if (!lockoutData) return false;
  
  const { timestamp }: LockoutData = JSON.parse(lockoutData);
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
    const { count, firstAttempt }: RateLimitData = JSON.parse(rateLimitData);
    // Reset counter if more than lockout duration has passed
    if (now - firstAttempt > LOCKOUT_DURATION) {
      attempts = 1;
    } else {
      attempts = count + 1;
    }
  }
  
  const newRateLimitData: RateLimitData = {
    count: attempts,
    firstAttempt: rateLimitData ? JSON.parse(rateLimitData).firstAttempt : now,
    lastAttempt: now
  };
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newRateLimitData));
  
  // Lock out user if max attempts reached
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutData: LockoutData = { timestamp: now };
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockoutData));
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
  
  const { timestamp }: LockoutData = JSON.parse(lockoutData);
  const now = Date.now();
  const remaining = LOCKOUT_DURATION - (now - timestamp);
  
  return Math.ceil(remaining / (60 * 1000)); // Return minutes
}

/**
 * Validate authentication mode
 */
export function validateAuthMode(mode: string): AuthMode {
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

// Interface for Appwrite error
interface AppwriteError {
  code?: number;
  message?: string;
  type?: string;
}

/**
 * Type guard for Appwrite errors
 */
function isAppwriteError(error: unknown): error is AppwriteError {
  return typeof error === 'object' && error !== null && ('code' in error || 'message' in error);
}

/**
 * Get current authentication mode from backend (with localStorage fallback)
 */
export async function getAuthMode(): Promise<AuthMode> {
  // read Team-Mode doc
  try {
    const doc = await safeAppwrite(
      databases.getDocument(DATABASE_ID, TEAM_MODE_COLLECTION_ID, TEAM_MODE_COLLECTION_ID),
      { operation: 'databases.getDocument', collectionId: TEAM_MODE_COLLECTION_ID, databaseId: DATABASE_ID, documentId: TEAM_MODE_COLLECTION_ID }
    );

    // if doc has boolean field `mode` (guard the shape before using it)
    if (doc) {
      const docAny = doc as unknown as Record<string, unknown>;
      if ('mode' in docAny && typeof docAny['mode'] === 'boolean') {
        const modeValue = Boolean(docAny['mode']);
        return modeValue ? 'registration' : 'team-login';
      }
    }
  } catch {
    // already logged by safeAppwrite; fallback to localStorage / default
    console.warn('[Auth Mode] Team-Mode read failed, falling back to localStorage or default.');
  }

  // fallback localStorage / default
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('authMode') : null;
    if (stored === 'registration' || stored === 'team-login') return stored as AuthMode;
  } catch {
    // noop
  }
  return 'team-login';
}

/**
 * Update authentication mode in backend (with localStorage fallback)
 * Updates the Team-Mode collection with mode boolean
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateAuthMode(mode: AuthMode, _updatedBy?: string): Promise<void> {
  const modeBool = mode === 'registration';
  console.log('=== UPDATE AUTH MODE ===');
  console.log('Mode:', mode);
  console.log('Mode Boolean:', modeBool);
  console.log('Database ID:', DATABASE_ID);
  console.log('Collection ID:', TEAM_MODE_COLLECTION_ID);
  console.log('Document ID:', TEAM_MODE_COLLECTION_ID);
  console.log('=======================');
  
  try {
    // Try to update the document first
    console.log('[Auth Mode] Attempting UPDATE...');
    await safeAppwrite(
      databases.updateDocument(DATABASE_ID, TEAM_MODE_COLLECTION_ID, TEAM_MODE_COLLECTION_ID, { mode: modeBool }),
      { operation: 'databases.updateDocument', collectionId: TEAM_MODE_COLLECTION_ID, databaseId: DATABASE_ID, documentId: TEAM_MODE_COLLECTION_ID }
    );
    // backup to localStorage
    if (typeof window !== 'undefined') localStorage.setItem('authMode', mode);
    console.log(`✅ [Auth Mode] Team-Mode updated: mode = ${modeBool} (${mode})`);
  } catch {
    // If update fails, try to create the document
    console.log('[Auth Mode] Update failed, attempting CREATE...');
    try {
      await safeAppwrite(
        databases.createDocument(
          DATABASE_ID, 
          TEAM_MODE_COLLECTION_ID, 
          TEAM_MODE_COLLECTION_ID, 
          { mode: modeBool },
          // Permissions for the document - allow anyone to read/update
          // You may need to adjust these based on your Appwrite permissions setup
        ),
        { operation: 'databases.createDocument', collectionId: TEAM_MODE_COLLECTION_ID, databaseId: DATABASE_ID, documentId: TEAM_MODE_COLLECTION_ID }
      );
      // backup to localStorage
      if (typeof window !== 'undefined') localStorage.setItem('authMode', mode);
      console.log(`✅ [Auth Mode] Team-Mode created: mode = ${modeBool} (${mode})`);
    } catch {
      // Both update and create failed - log and fallback to localStorage only
      console.error('[Auth Mode] Both update and create failed. Using localStorage only.');
      if (typeof window !== 'undefined') localStorage.setItem('authMode', mode);
      // Don't throw - we still saved to localStorage
      console.log(`⚠️ [Auth Mode] Saved to localStorage only: ${mode}`);
    }
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
  } catch {
    // Document doesn't exist, create it with default settings
    console.warn('Auth settings document not found, creating default settings');
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
 * Team document stored in the database
 */
export interface TeamDocument {
  $id?: string;
  teamName: string;
  teamCode: string;
  password: string;
  [key: string]: unknown;
}

/**
 * Interface for Appwrite list response
 */
interface ListDocumentsResponse {
  documents: TeamDocument[];
  total: number;
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
    
    // Query Appwrite database for teams collection using Query filters for better performance
    try {
      // Import Query from appwrite
      const { Query } = await import('appwrite');
      
      // Fetch team by teamCode first (more specific query)
      const response = await databases.listDocuments(
        DATABASE_ID,
        'teams',
        [Query.equal('teamCode', sanitizedCredentials.teamCode)]
      ) as unknown as ListDocumentsResponse;
      
      if (!response || !Array.isArray(response.documents) || response.documents.length === 0) {
        // Team not found
        console.log('[Auth] No team found with teamCode:', sanitizedCredentials.teamCode);
        return false;
      }
      
      // Find a matching team by teamCode and teamName (case-insensitive)
      const team = response.documents.find(d =>
        String(d.teamCode).trim() === sanitizedCredentials.teamCode.trim()
        && String(d.teamName).toLowerCase().trim() === sanitizedCredentials.teamName.toLowerCase().trim()
      );
      
      if (!team) {
        // No exact match found (team code matches but team name doesn't)
        console.log('[Auth] Team code found but team name mismatch');
        return false;
      }
      
      // Verify password matches exactly
      const passwordMatch = String(team.password) === sanitizedCredentials.password;
      
      if (!passwordMatch) {
        console.log('[Auth] Password mismatch for team:', sanitizedCredentials.teamCode);
      } else {
        console.log('[Auth] ✅ Team credentials validated successfully');
      }
      
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      return passwordMatch;
      
    } catch (dbError: unknown) {
      // If teams collection doesn't exist yet, log warning and return false
      if (isAppwriteError(dbError) && (dbError.code === 404 || dbError.message?.includes('Collection'))) {
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
 * Interface for session data
 */
interface TeamSessionData {
  sessionId: string;
  teamName: string;
  teamCode: string;
  loginTime: string;
  expiresAt: string;
  isValid: boolean;
}

/**
 * Create a team session from a Team object (used after individual login)
 */
export async function createTeamSessionForTeam(team: { teamName: string; teamCode: string }): Promise<string> {
  try {
    const sessionId = ID.unique();
    const loginTime = new Date().toISOString();
    const sessionData: TeamSessionData = {
      sessionId,
      teamName: sanitizeString(team.teamName),
      teamCode: sanitizeString(team.teamCode),
      loginTime,
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
      isValid: true
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('teamSession', JSON.stringify(sessionData));
    }

    return sessionId;
  } catch (error) {
    console.error('Error creating team session from team object:', error);
    throw new Error('Failed to create team session');
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
      // Safely read rate limit data
      let attempts = 1;
      try {
        const rateLimitData = typeof window !== 'undefined' ? localStorage.getItem(RATE_LIMIT_KEY) : null;
        attempts = rateLimitData ? (JSON.parse(rateLimitData) as RateLimitData).count : 1;
      } catch {
        attempts = 1;
      }

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
    const sessionData: TeamSessionData = {
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
    
    // Rethrow validation errors so caller can handle form-level feedback
    if (error instanceof AuthValidationError) {
      throw error;
    }

    // For all other errors, return a structured failure response
    return {
      success: false,
      error: 'Failed to create team session due to a system error'
    };
  }
}

/**
 * Get current team session from localStorage
 */
export function getTeamSession(): TeamSessionData | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const sessionData = localStorage.getItem('teamSession');
    if (!sessionData) {
      return null;
    }
    
    return JSON.parse(sessionData) as TeamSessionData;
  } catch (error) {
    console.error('Error getting team session:', error);
    return null;
  }
}

/**
 * Check if current team session is valid
 */
export function isTeamSessionValid(): boolean {
  try {
    const session = getTeamSession();
    
    if (!session || !session.isValid) {
      return false;
    }
    
    // Check if session has expired
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    
    if (now > expiresAt) {
      // Session expired, clear it
      clearTeamSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating team session:', error);
    return false;
  }
}

/**
 * Clear team session from localStorage
 */
export function clearTeamSession(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('teamSession');
    }
  } catch (error) {
        console.error('Error clearing team session:', error);
  }
}
