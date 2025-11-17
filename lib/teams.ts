// lib/teams.ts
import { databases, DATABASE_ID, TEAMS_COLLECTION_ID, safeAppwrite } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';

// Team interface used by admin page and team flows
export interface Team {
  $id?: string;
  teamName: string;
  teamCode: string;
  password: string;
  memberIds?: string[];
  questionSetId?: string; // Legacy field for backward compatibility
  indoorQuestionSetId?: string; // Indoor question set assignment
  outdoorQuestionSetId?: string; // Outdoor question set assignment
  score?: number;
  indoorScore?: number;
  outdoorScore?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface CreateTeamRequest {
  teamName: string;
  teamCode: string;
  password: string;
  memberIds?: string[];
  questionSetId?: string; // Legacy field
  indoorQuestionSetId?: string; // Indoor question set
  outdoorQuestionSetId?: string; // Outdoor question set
}

export interface UpdateTeamRequest {
  teamName?: string;
  teamCode?: string;
  password?: string;
  memberIds?: string[];
  questionSetId?: string; // Legacy field
  indoorQuestionSetId?: string; // Indoor question set
  outdoorQuestionSetId?: string; // Outdoor question set
  score?: number;
  indoorScore?: number;
  outdoorScore?: number;
}

// Validation constants (match UI expectations)
const TEAM_NAME_MIN_LENGTH = 3;
const TEAM_NAME_MAX_LENGTH = 128;
const TEAM_CODE_MIN_LENGTH = 4;
const TEAM_CODE_MAX_LENGTH = 25;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30;

export class TeamValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'TeamValidationError';
  }
}

function sanitizeString(value: unknown): string {
  return String(value || '').trim();
}

function validateTeamData(data: Partial<CreateTeamRequest | UpdateTeamRequest>): void {
  if ('teamName' in data && data.teamName !== undefined) {
    const name = sanitizeString(data.teamName);
    if (name.length < TEAM_NAME_MIN_LENGTH || name.length > TEAM_NAME_MAX_LENGTH) {
      throw new TeamValidationError(`Team name must be ${TEAM_NAME_MIN_LENGTH}-${TEAM_NAME_MAX_LENGTH} characters`, 'teamName');
    }
  }
  if ('teamCode' in data && data.teamCode !== undefined) {
    const code = sanitizeString(data.teamCode);
    if (code.length < TEAM_CODE_MIN_LENGTH || code.length > TEAM_CODE_MAX_LENGTH) {
      throw new TeamValidationError(`Team code must be ${TEAM_CODE_MIN_LENGTH}-${TEAM_CODE_MAX_LENGTH} characters`, 'teamCode');
    }
  }
  if ('password' in data && data.password !== undefined) {
    const pass = sanitizeString(data.password);
    if (pass.length < PASSWORD_MIN_LENGTH || pass.length > PASSWORD_MAX_LENGTH) {
      throw new TeamValidationError(`Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`, 'password');
    }
  }
  if ('memberIds' in data && data.memberIds !== undefined) {
    const ids = Array.isArray(data.memberIds) ? data.memberIds : [];
    if (!ids.every(id => typeof id === 'string' && id.trim().length > 0)) {
      throw new TeamValidationError('All member IDs must be non-empty strings', 'memberIds');
    }
  }
}

export async function createTeam(request: CreateTeamRequest): Promise<Team> {
  validateTeamData(request);
  const docData: Record<string, unknown> = {
    teamName: sanitizeString(request.teamName),
    teamCode: sanitizeString(request.teamCode),
    password: sanitizeString(request.password),
    memberIds: request.memberIds || [],
    questionSetId: request.questionSetId || null,
    indoorQuestionSetId: request.indoorQuestionSetId || null,
    outdoorQuestionSetId: request.outdoorQuestionSetId || null,
  };
  const created = await safeAppwrite(
    databases.createDocument(DATABASE_ID, TEAMS_COLLECTION_ID, ID.unique(), docData),
    { operation: 'databases.createDocument', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID }
  );
  return created as unknown as Team;
}

export async function updateTeam(teamId: string, request: UpdateTeamRequest): Promise<Team> {
  validateTeamData(request);
  const docData: Record<string, unknown> = {};
  if (request.teamName !== undefined) docData.teamName = sanitizeString(request.teamName);
  if (request.teamCode !== undefined) docData.teamCode = sanitizeString(request.teamCode);
  if (request.password !== undefined) docData.password = sanitizeString(request.password);
  if (request.memberIds !== undefined) docData.memberIds = request.memberIds;
  if (request.questionSetId !== undefined) docData.questionSetId = request.questionSetId || null;
  if (request.indoorQuestionSetId !== undefined) docData.indoorQuestionSetId = request.indoorQuestionSetId || null;
  if (request.outdoorQuestionSetId !== undefined) docData.outdoorQuestionSetId = request.outdoorQuestionSetId || null;
  if (request.score !== undefined) docData.score = request.score;
  if (request.indoorScore !== undefined) docData.indoorScore = request.indoorScore;
  if (request.outdoorScore !== undefined) docData.outdoorScore = request.outdoorScore;

  const updated = await safeAppwrite(
    databases.updateDocument(DATABASE_ID, TEAMS_COLLECTION_ID, teamId, docData),
    { operation: 'databases.updateDocument', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID, documentId: teamId }
  );
  return updated as unknown as Team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  await safeAppwrite(
    databases.deleteDocument(DATABASE_ID, TEAMS_COLLECTION_ID, teamId),
    { operation: 'databases.deleteDocument', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID, documentId: teamId }
  );
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    const response = await safeAppwrite(
      databases.listDocuments(DATABASE_ID, TEAMS_COLLECTION_ID, [
        Query.orderDesc('$createdAt'),
        Query.limit(1000) // Increase limit to fetch all teams (default is 25)
      ]),
      { operation: 'databases.listDocuments', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID }
    );
    const docs = (response as unknown as Models.DocumentList<Models.Document>).documents;
    return docs as unknown as Team[];
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string };
    if (e?.code === 404 || e?.message?.includes('Collection')) {
      // If teams collection not found, return empty list to keep admin page functional
      console.warn('Teams collection not found in Appwrite. Returning empty list.');
      return [];
    }
    throw err;
  }
}

export async function getTeamByCode(teamCode: string): Promise<Team | null> {
  const sanitized = sanitizeString(teamCode);
  const response = await safeAppwrite(
    databases.listDocuments(DATABASE_ID, TEAMS_COLLECTION_ID, [Query.equal('teamCode', sanitized)]),
    { operation: 'databases.listDocuments', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID }
  );
  const docs = (response as unknown as Models.DocumentList<Models.Document>).documents as unknown as Team[];
  return docs[0] ?? null;
}

export async function getTeamsByScore(): Promise<Team[]> {
  try {
    const response = await safeAppwrite(
      databases.listDocuments(DATABASE_ID, TEAMS_COLLECTION_ID, [
        Query.orderDesc('score'),
        Query.orderDesc('$createdAt'),
        Query.limit(1000) // Increase limit to fetch all teams (default is 25)
      ]),
      { operation: 'databases.listDocuments', collectionId: TEAMS_COLLECTION_ID, databaseId: DATABASE_ID }
    );
    const docs = (response as unknown as Models.DocumentList<Models.Document>).documents;
    return docs as unknown as Team[];
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string };
    if (e?.code === 404 || e?.message?.includes('Collection')) {
      console.warn('Teams collection not found in Appwrite. Returning empty list.');
      return [];
    }
    throw err;
  }
}