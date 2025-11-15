/**
 * Centralized score synchronization utility
 * This ensures indoor and outdoor scores are always combined correctly
 */

import { databases, DATABASE_ID, QUESTION_SET_COLLECTION_ID } from './appwrite';
import { Query } from 'appwrite';

interface Question {
  id: string;
  points: number;
  question?: string | string[];
  correctAnswer?: string;
  hint?: string | string[];
}

interface AnswerState {
  [key: string]: {
    answered: boolean;
    correct: boolean;
    userAnswer: string;
  };
}

/**
 * Calculate indoor mission score for a team
 * Includes hint deductions
 * Now fetches questions from Appwrite
 */
export async function calculateIndoorScore(teamCode: string): Promise<number> {
  try {
    const storageKey = `indoorMissionAnswers_${teamCode}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      console.log(`[Indoor Score] No answers found for team ${teamCode}`);
      return 0;
    }
    
    const answerStates: AnswerState = JSON.parse(stored);
    
    // Fetch questions from Appwrite instead of localStorage
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      
      if (response.documents.length === 0) {
        console.log(`[Indoor Score] No questions found in Appwrite for team ${teamCode}`);
        return 0;
      }
      
      // Transform Appwrite documents to Question format
      const questions: Question[] = response.documents.map((doc) => ({
        id: doc.$id,
        points: doc.points as number
      }));
      
      let score = 0;
      
      // Calculate score from correct answers
      Object.keys(answerStates).forEach((key) => {
        if (answerStates[key].correct) {
          const question = questions.find((q) => q.id === key);
          if (question) {
            score += question.points;
            console.log(`[Indoor Score] Team ${teamCode}: Question ${key} = ${question.points} points`);
          }
        }
      });
      
      // Deduct points for hints
      const hintsKey = `indoorMissionHints_${teamCode}`;
      const storedHints = localStorage.getItem(hintsKey);
      
      if (storedHints) {
        const hintsUsed = JSON.parse(storedHints);
        const hintCount = Object.keys(hintsUsed).length;
        const deduction = hintCount * 2;
        score = Math.max(0, score - deduction);
        console.log(`[Indoor Score] Team ${teamCode}: Deducted ${deduction} points for ${hintCount} hints`);
      }
      
      console.log(`[Indoor Score] Team ${teamCode}: Final indoor score = ${score}`);
      return score;
    } catch (appwriteError) {
      console.error('[Indoor Score] Error fetching questions from Appwrite:', appwriteError);
      return 0;
    }
  } catch (error) {
    console.error('[Indoor Score] Error calculating indoor score:', error);
    return 0;
  }
}

/**
 * Calculate outdoor mission score for a team
 * No hint deductions for outdoor
 * Now fetches questions from Appwrite
 */
export async function calculateOutdoorScore(teamCode: string): Promise<number> {
  try {
    const storageKey = `outdoorMissionAnswers_${teamCode}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      console.log(`[Outdoor Score] No answers found for team ${teamCode}`);
      return 0;
    }
    
    const answerStates: AnswerState = JSON.parse(stored);
    
    // Fetch questions from Appwrite outdoor collection
    try {
      const OUTDOOR_COLLECTION_ID = 'outdoor';
      const response = await databases.listDocuments(
        DATABASE_ID,
        OUTDOOR_COLLECTION_ID,
        [Query.orderAsc('$createdAt')]
      );
      
      if (response.documents.length === 0) {
        console.log(`[Outdoor Score] No questions found in Appwrite for team ${teamCode}`);
        return 0;
      }
      
      // Transform Appwrite documents to Question format
      const questions: Question[] = response.documents.map((doc) => ({
        id: doc.$id,
        points: doc.points as number
      }));
      
      let score = 0;
      
      // Calculate score from correct answers
      Object.keys(answerStates).forEach((key) => {
        if (answerStates[key].correct) {
          const question = questions.find((q) => q.id === key);
          if (question) {
            score += question.points;
            console.log(`[Outdoor Score] Team ${teamCode}: Question ${key} = ${question.points} points`);
          }
        }
      });
      
      console.log(`[Outdoor Score] Team ${teamCode}: Final outdoor score = ${score}`);
      return score;
    } catch (appwriteError) {
      console.error('[Outdoor Score] Error fetching questions from Appwrite:', appwriteError);
      return 0;
    }
  } catch (error) {
    console.error('[Outdoor Score] Error calculating outdoor score:', error);
    return 0;
  }
}

/**
 * Calculate combined total score for a team
 */
export async function calculateTotalScore(teamCode: string): Promise<{
  indoor: number;
  outdoor: number;
  total: number;
}> {
  const indoor = await calculateIndoorScore(teamCode);
  const outdoor = await calculateOutdoorScore(teamCode);
  const total = indoor + outdoor;
  
  return { indoor, outdoor, total };
}

/**
 * Sync team's combined score to Appwrite
 */
export async function syncTeamScoreToAppwrite(teamCode: string): Promise<void> {
  try {
    console.log(`[Score Sync] Starting sync for team ${teamCode}...`);
    
    const { indoor, outdoor, total } = await calculateTotalScore(teamCode);
    
    console.log(`[Score Sync] Team ${teamCode}: Indoor=${indoor}, Outdoor=${outdoor}, Total=${total}`);
    
    if (total === 0) {
      console.log(`[Score Sync] Note: Total score is 0 for team ${teamCode}. This will be synced to Appwrite.`);
    }
    
    // Dynamically import to avoid circular dependencies
    const { getTeamByCode } = await import('./teams');
    
    console.log(`[Score Sync] Fetching team data from Appwrite for team ${teamCode}...`);
    const team = await getTeamByCode(teamCode);
    
    if (!team) {
      console.error(`[Score Sync] ❌ Team not found in Appwrite database: ${teamCode}`);
      console.error(`[Score Sync] Make sure the team exists in the teams collection with teamCode="${teamCode.toUpperCase()}"`);
      throw new Error(`Team ${teamCode} not found in Appwrite`);
    }
    
    if (!team.$id) {
      console.error(`[Score Sync] ❌ Team found but has no $id: ${teamCode}`, team);
      throw new Error(`Team ${teamCode} has no document ID`);
    }
    
    console.log(`[Score Sync] Team found in Appwrite:`, {
      id: team.$id,
      teamName: team.teamName,
      teamCode: team.teamCode,
      currentScore: team.score || 0,
      newScore: total
    });
    
    console.log(`[Score Sync] Updating team ${teamCode} (ID: ${team.$id}) with score: ${total}...`);
    
    // Import databases directly to bypass updateTeam and control exactly what fields are sent
    const { databases, DATABASE_ID, TEAMS_COLLECTION_ID } = await import('./appwrite');
    
    // Try to update with all score fields first
    try {
      await databases.updateDocument(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        team.$id,
        {
          score: total,
          indoorScore: indoor,
          outdoorScore: outdoor
        }
      );
      console.log(`[Score Sync] ✅ Successfully synced all scores (total: ${total}, indoor: ${indoor}, outdoor: ${outdoor}) to Appwrite for team ${teamCode}`);
    } catch (updateError: unknown) {
      // Check various error properties that Appwrite might use
      const err = updateError as { 
        message?: string; 
        response?: { message?: string }; 
        type?: string;
        code?: number | string;
      };
      
      const errorMessage = err?.message || err?.response?.message || String(updateError);
      const errorType = err?.type || '';
      
      console.warn(`[Score Sync] Update error detected:`, { errorMessage, errorType, code: err?.code });
      
      // Check if it's a schema-related error
      if (
        errorMessage.includes('Unknown attribute') || 
        errorMessage.includes('indoorScore') || 
        errorMessage.includes('outdoorScore') ||
        errorMessage.includes('Invalid document structure') ||
        errorType.includes('attribute')
      ) {
        console.warn(`[Score Sync] ⚠️ Database schema doesn't support indoorScore/outdoorScore. Updating total score only.`);
        
        // Fall back to updating ONLY the total score field
        try {
          await databases.updateDocument(
            DATABASE_ID,
            TEAMS_COLLECTION_ID,
            team.$id,
            { score: total }
          );
          console.log(`[Score Sync] ✅ Successfully synced ${total} points to Appwrite for team ${teamCode}`);
        } catch (fallbackError) {
          console.error(`[Score Sync] ❌ Failed to update even with just score field:`, fallbackError);
          throw fallbackError;
        }
      } else {
        // Re-throw if it's a different type of error
        console.error(`[Score Sync] Unexpected error type during update:`, updateError);
        throw updateError;
      }
    }
  } catch (error) {
    console.error('[Score Sync] ❌ Error syncing score to Appwrite:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('[Score Sync] Error message:', error.message);
      console.error('[Score Sync] Error stack:', error.stack);
    }
    
    throw error;
  }
}

/**
 * Debug function to check team's score status
 */
export async function debugTeamScore(teamCode: string): Promise<void> {
  console.log(`\n=== Debug Score for Team ${teamCode} ===`);
  
  // Check indoor answers
  const indoorAnswers = localStorage.getItem(`indoorMissionAnswers_${teamCode}`);
  console.log('Indoor Answers:', indoorAnswers ? JSON.parse(indoorAnswers) : 'None');
  
  // Check outdoor answers
  const outdoorAnswers = localStorage.getItem(`outdoorMissionAnswers_${teamCode}`);
  console.log('Outdoor Answers:', outdoorAnswers ? JSON.parse(outdoorAnswers) : 'None');
  
  // Fetch questions from Appwrite
  try {
    const OUTDOOR_COLLECTION_ID = 'outdoor';
    const outdoorQuestionsResponse = await databases.listDocuments(
      DATABASE_ID,
      OUTDOOR_COLLECTION_ID
    );
    console.log('Outdoor Questions in Appwrite:', outdoorQuestionsResponse.documents.length, 'questions');
    
    const indoorQuestionsResponse = await databases.listDocuments(
      DATABASE_ID,
      QUESTION_SET_COLLECTION_ID
    );
    console.log('Indoor Questions in Appwrite:', indoorQuestionsResponse.documents.length, 'questions');
  } catch (error) {
    console.error('Error fetching questions from Appwrite:', error);
  }
  
  // Check hints
  const hints = localStorage.getItem(`indoorMissionHints_${teamCode}`);
  console.log('Hints Used:', hints ? JSON.parse(hints) : 'None');
  
  // Calculate scores
  const scores = await calculateTotalScore(teamCode);
  console.log(`\nCalculated Scores:
  - Indoor: ${scores.indoor}
  - Outdoor: ${scores.outdoor}
  - Total: ${scores.total}`);
  
  console.log('=== End Debug ===\n');
}
