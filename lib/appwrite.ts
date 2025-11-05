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

// Database configuration
export const DATABASE_ID = '68efd8c400255230a04a';
export const USERS_COLLECTION_ID = '15'; // Changed from '15' to a more descriptive name

// Auth settings collection for the authentication mode toggle
export const AUTH_SETTINGS_COLLECTION_ID = 'auth-settings';

// Teams collection for team-based authentication
export const TEAMS_COLLECTION_ID = 'teams';

// Team members collection for detailed team member information
export const TEAM_MEMBERS_COLLECTION_ID = 'team-members';

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
