// lib/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68efd81f00170987dcdc');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper function to safely get current user
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    // User is not authenticated, return null instead of throwing
    return null;
  }
};

// Safe Appwrite call wrapper: logs context and rethrows for caller handling
export async function safeAppwrite<T>(promise: Promise<T>, context?: Record<string, unknown>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Appwrite Error]', { message, context });
    throw error;
  }
}

// Database configuration
export const DATABASE_ID = '68efd8c400255230a04a';
export const USERS_COLLECTION_ID = '15'; // Changed from '15' to a more descriptive name

// Auth settings collection for the authentication mode toggle
export const AUTH_SETTINGS_COLLECTION_ID = 'auth-settings';

// Teams collection for team-based authentication
export const TEAMS_COLLECTION_ID = 'teams';

// Team-Mode collection for storing boolean modeOption
export const TEAM_MODE_COLLECTION_ID = 'Team-Mode';

// Question Set collection for storing quiz questions
export const QUESTION_SET_COLLECTION_ID = 'question-set';

// Storage configuration
export const PROFILE_PICTURES_BUCKET_ID = 'profile-pictures'; // You'll create this bucket in Appwrite
export const BKASH_RECEIPTS_BUCKET_ID = 'bkash-receipts'; // Bucket for bKash transaction photos

// Helper function to get profile picture URL
export const getProfilePictureUrl = (fileId: string) => {
  if (!fileId) return null;
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PROFILE_PICTURES_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68efd81f00170987dcdc'}`;
};

// Helper function to get bKash receipt URL
export const getBkashReceiptUrl = (fileId: string) => {
  if (!fileId) return null;
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BKASH_RECEIPTS_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68efd81f00170987dcdc'}`;
};

export { client };
