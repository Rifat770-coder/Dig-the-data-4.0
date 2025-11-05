// lib/team-api.ts
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from './appwrite';
import { ID, Query, Models } from 'appwrite';

// Collection IDs
export const TEAMS_COLLECTION_ID = 'teams';

export interface Team {
  $id?: string;
  teamName: string;
  teamCode: string;
  password: string;
  memberIds?: string[]; // Array of user IDs
  score?: number; // Team's current score
  $createdAt?: string; // Appwrite built-in field
  $updatedAt?: string; // Appwrite built-in field
}

export interface CreateTeamRequest {
  teamName: string;
  teamCode: string;
  password: string;
  memberIds?: string[]; // Array of user IDs
}

export interface UpdateTeamRequest {
  teamName?: string;
  teamCode?: string;
  password?: string;
  memberIds?: string[]; // Array of user IDs
}

// Validation constants
const TEAM_NAME_MIN_LENGTH = 3;
const TEAM_NAME_MAX_LENGTH = 128; // Match Appwrite schema
const TEAM_CODE_MIN_LENGTH = 4;
const TEAM_CODE_MAX_LENGTH = 25; // Match Appwrite schema
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30; // Match Appwrite schema

// Error classes
export class TeamValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'TeamValidationError';
  }
}

export class TeamPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamPermissionError';
  }
}

export class TeamNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamNotFoundError';
  }
}

/**
 * Validate team data
 */
function validateTeamData(data: CreateTeamRequest | UpdateTeamRequest): void {
  if ('teamName' in data && data.teamName !== undefined) {
    if (!data.teamName || typeof data.teamName !== 'string') {
      throw new TeamValidationError('Team name is required', 'teamName');
    }
    
    const trimmedName = data.teamName.trim();
    if (trimmedName.length < TEAM_NAME_MIN_LENGTH) {
      throw new TeamValidationError(`Team name must be at least ${TEAM_NAME_MIN_LENGTH} characters long`, 'teamName');
    }
    
    if (trimmedName.length > TEAM_NAME_MAX_LENGTH) {
      throw new TeamValidationError(`Team name must not exceed ${TEAM_NAME_MAX_LENGTH} characters`, 'teamName');
    }
  }

  if ('teamCode' in data && data.teamCode !== undefined) {
    if (!data.teamCode || typeof data.teamCode !== 'string') {
      throw new TeamValidationError('Team code is required', 'teamCode');
    }
    
    const trimmedCode = data.teamCode.trim();
    if (trimmedCode.length < TEAM_CODE_MIN_LENGTH) {
      throw new TeamValidationError(`Team code must be at least ${TEAM_CODE_MIN_LENGTH} characters long`, 'teamCode');
    }
    
    if (trimmedCode.length > TEAM_CODE_MAX_LENGTH) {
      throw new TeamValidationError(`Team code must not exceed ${TEAM_CODE_MAX_LENGTH} characters`, 'teamCode');
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(trimmedCode)) {
      throw new TeamValidationError('Team code must contain only letters and numbers', 'teamCode');
    }
  }

  if ('password' in data && data.password !== undefined) {
    if (!data.password || typeof data.password !== 'string') {
      throw new TeamValidationError('Password is required', 'password');
    }
    
    if (data.password.length < PASSWORD_MIN_LENGTH) {
      throw new TeamValidationError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`, 'password');
    }
    
    if (data.password.length > PASSWORD_MAX_LENGTH) {
      throw new TeamValidationError(`Password must not exceed ${PASSWORD_MAX_LENGTH} characters`, 'password');
    }
  }
}

/**
 * Check if user is admin (simplified check - in production, use proper role-based auth)
 */
async function checkAdminPermission(): Promise<void> {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    throw new TeamPermissionError('Admin functions only available in browser');
  }
  
  // For now, we'll use a simple admin check
  // In production, you should implement proper role-based access control
  const isAdmin = sessionStorage.getItem('adminAuthenticated') === 'true';
  
  if (!isAdmin) {
    throw new TeamPermissionError('Admin privileges required');
  }
}

/**
 * Create a new team
 */
export async function createTeam(teamData: CreateTeamRequest): Promise<Team> {
  try {
    await checkAdminPermission();
    validateTeamData(teamData);
    
    // Check if team code already exists
    const existingTeams = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [Query.equal('teamCode', teamData.teamCode.trim().toUpperCase())]
    );
    
    if (existingTeams.documents.length > 0) {
      throw new TeamValidationError('Team code already exists', 'teamCode');
    }
    
    // Check if team name already exists
    const existingTeamNames = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [Query.equal('teamName', teamData.teamName.trim())]
    );
    
    if (existingTeamNames.documents.length > 0) {
      throw new TeamValidationError('Team name already exists', 'teamName');
    }
    
    const team: Omit<Team, '$id' | '$createdAt' | '$updatedAt'> = {
      teamName: teamData.teamName.trim(),
      teamCode: teamData.teamCode.trim().toUpperCase(),
      password: teamData.password,
      memberIds: teamData.memberIds || []
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      team
    );
    
    return response as unknown as Team;
  } catch (error) {
    if (error instanceof TeamValidationError || error instanceof TeamPermissionError) {
      throw error;
    }
    throw new Error(`Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    await checkAdminPermission();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );
    
    return response.documents as unknown as Team[];
  } catch (error) {
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    
    // Handle Appwrite permission errors with helpful message
    const err = error as { type?: string; message?: string };
    if (err?.type === 'general_unauthorized_scope' || err?.message?.includes('authorized')) {
      throw new Error('Permission denied. Please ensure the teams collection has proper read permissions set in Appwrite Console. Go to Database → teams collection → Settings → Permissions and set Read permission to "role:all" or "role:guests".');
    }
    
    throw new Error(`Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: string): Promise<Team> {
  try {
    await checkAdminPermission();
    
    const response = await databases.getDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId
    );
    
    return response as unknown as Team;
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err?.code === 404) {
      throw new TeamNotFoundError('Team not found');
    }
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    throw new Error(`Failed to fetch team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update team
 */
export async function updateTeam(teamId: string, updateData: UpdateTeamRequest): Promise<Team> {
  try {
    await checkAdminPermission();
    validateTeamData(updateData);
    
    // Check if team exists
    const existingTeam = await getTeamById(teamId);
    
    // If updating team code, check for conflicts
    if (updateData.teamCode && updateData.teamCode !== existingTeam.teamCode) {
      const conflictingTeams = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [
          Query.equal('teamCode', updateData.teamCode.trim().toUpperCase()),
          Query.notEqual('$id', teamId)
        ]
      );
      
      if (conflictingTeams.documents.length > 0) {
        throw new TeamValidationError('Team code already exists', 'teamCode');
      }
    }
    
    // If updating team name, check for conflicts
    if (updateData.teamName && updateData.teamName !== existingTeam.teamName) {
      const conflictingNames = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [
          Query.equal('teamName', updateData.teamName.trim()),
          Query.notEqual('$id', teamId)
        ]
      );
      
      if (conflictingNames.documents.length > 0) {
        throw new TeamValidationError('Team name already exists', 'teamName');
      }
    }
    
    // Prepare update data
    const finalUpdateData: Partial<Team> = {};
    
    if (updateData.teamName) {
      finalUpdateData.teamName = updateData.teamName.trim();
    }
    if (updateData.teamCode) {
      finalUpdateData.teamCode = updateData.teamCode.trim().toUpperCase();
    }
    if (updateData.password) {
      finalUpdateData.password = updateData.password;
    }
    if (updateData.memberIds !== undefined) {
      finalUpdateData.memberIds = updateData.memberIds;
    }
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId,
      finalUpdateData
    );
    
    return response as unknown as Team;
  } catch (error) {
    if (error instanceof TeamValidationError || error instanceof TeamPermissionError || error instanceof TeamNotFoundError) {
      throw error;
    }
    throw new Error(`Failed to update team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete team
 */
export async function deleteTeam(teamId: string): Promise<void> {
  try {
    // Check admin permission (client-side validation)
    await checkAdminPermission();
    
    // Delete the team document
    await databases.deleteDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId
    );
  } catch (error: unknown) {
    const err = error as { code?: number; type?: string; message?: string };
    
    // Handle specific error cases
    if (err?.code === 404) {
      throw new TeamNotFoundError('Team not found');
    }
    
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    
    // Handle Appwrite permission errors
    if (err?.type === 'general_unauthorized_scope' || err?.message?.includes('authorized')) {
      throw new Error('Permission denied. Please ensure the teams collection has proper delete permissions set in Appwrite Console.');
    }
    
    throw new Error(`Failed to delete team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get team by team code (for team login)
 */
export async function getTeamByCode(teamCode: string): Promise<Team | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [
        Query.equal('teamCode', teamCode.toUpperCase())
      ]
    );
    
    if (response.documents.length === 0) {
      return null;
    }
    
    return response.documents[0] as unknown as Team;
  } catch (error) {
    throw new Error(`Failed to fetch team by code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all users (for team management)
 * Note: In the new schema, teams don't store member IDs, so all users are available
 */
export async function getAvailableUsers(): Promise<Models.Document[]> {
  try {
    await checkAdminPermission();
    
    // Get all users
    const allUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.orderAsc('name')]
    );
    
    return allUsers.documents;
  } catch (error) {
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    
    // Handle Appwrite permission errors with helpful message
    const err = error as { type?: string; message?: string };
    if (err?.type === 'general_unauthorized_scope' || err?.message?.includes('authorized')) {
      throw new Error('Permission denied. Please ensure the users collection has proper read permissions set in Appwrite Console. Go to your database collections and set Read permission to "role:all" or "role:guests".');
    }
    
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm: string): Promise<Models.Document[]> {
  try {
    await checkAdminPermission();
    
    if (!searchTerm.trim()) {
      return await getAvailableUsers();
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID, // Use the correct users collection ID
      [
        Query.or([
          Query.search('name', searchTerm),
          Query.search('email', searchTerm)
        ]),
        Query.orderAsc('name')
      ]
    );
    
    return response.documents;
  } catch (error) {
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    
    // Handle Appwrite permission errors
    const err = error as { type?: string; message?: string };
    if (err?.type === 'general_unauthorized_scope' || err?.message?.includes('authorized')) {
      throw new Error('Permission denied. Please ensure the users collection has proper read permissions set in Appwrite Console.');
    }
    
    throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update team score
 */
export async function updateTeamScore(teamId: string, score: number): Promise<Team> {
  try {
    await checkAdminPermission();
    
    if (typeof score !== 'number' || score < 0) {
      throw new TeamValidationError('Score must be a non-negative number', 'score');
    }
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId,
      { score }
    );
    
    return response as unknown as Team;
  } catch (error) {
    if (error instanceof TeamValidationError || error instanceof TeamPermissionError) {
      throw error;
    }
    throw new Error(`Failed to update team score: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update team score (for teams to update their own score, no admin check)
 * This allows teams to update their own scores during gameplay
 */
export async function updateOwnTeamScore(teamId: string, score: number): Promise<Team> {
  try {
    if (typeof score !== 'number' || score < 0) {
      throw new TeamValidationError('Score must be a non-negative number', 'score');
    }
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId,
      { score }
    );
    
    return response as unknown as Team;
  } catch (error) {
    if (error instanceof TeamValidationError) {
      throw error;
    }
    throw new Error(`Failed to update team score: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get teams sorted by score (for leaderboard)
 */
export async function getTeamsByScore(): Promise<Team[]> {
  try {
    await checkAdminPermission();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [Query.orderDesc('score'), Query.orderAsc('teamName')]
    );
    
    return response.documents as unknown as Team[];
  } catch (error) {
    if (error instanceof TeamPermissionError) {
      throw error;
    }
    throw new Error(`Failed to fetch leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add points to team score (for game interactions)
 * This function does NOT require admin permission - teams can update their own scores
 * Supports both positive (add) and negative (deduct) values
 */
export async function addPointsToTeam(teamCode: string, points: number): Promise<Team> {
  try {
    if (typeof points !== 'number') {
      throw new TeamValidationError('Points must be a number', 'points');
    }
    
    // Get the team by team code
    const team = await getTeamByCode(teamCode);
    
    if (!team || !team.$id) {
      throw new TeamNotFoundError('Team not found');
    }
    
    // Calculate new score (ensure it doesn't go below 0)
    const currentScore = team.score || 0;
    const newScore = Math.max(0, currentScore + points);
    
    // Update the team's score
    const response = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      team.$id,
      { score: newScore }
    );
    
    return response as unknown as Team;
  } catch (error) {
    if (error instanceof TeamValidationError || error instanceof TeamNotFoundError) {
      throw error;
    }
    throw new Error(`Failed to add points to team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}