'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { account, databases, DATABASE_ID, TEAMS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../../lib/appwrite';
import { Models, Query } from 'appwrite';

interface TeamData {
  $id: string;
  teamName: string;
  teamCode: string;
  password: string;
  memberIds: string[];
  questionSetId?: string;
  score?: number;
 
}

interface UserData {
  $id: string;
  name: string;
  email: string;
  userId: string;
  department: string;
  Phone: number;
}

// getTeamByCode was removed because it was defined but never used; team lookups are performed inline in fetchTeamData.

export default function TeamProfilePage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTeamData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Separate navigation effect to avoid render-phase updates
  useEffect(() => {
    if (error && (error.includes('not authenticated') || error.includes('missing scope'))) {
      router.replace('/login?type=individual&next=/profile/team');
    }
  }, [error, router]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');

      // STEP 1: First, ALWAYS check for individual authentication when accessing team profile
      let hasIndividualAuth = false;
      let user: Models.User<Models.Preferences> | null = null;
      
      try {
        user = await account.get();
        hasIndividualAuth = true;
        // Note: setCurrentUserId will be updated later with custom userId after fetching from users collection
        console.log('[Team Profile] ✅ Individual authentication verified:', user.$id);
      } catch {
        console.log('[Team Profile] ❌ No individual authentication found');
      }

      // STEP 2: If NO individual authentication, redirect to login immediately
      // This ensures that when team login is enabled, users must authenticate individually first
      if (!hasIndividualAuth) {
        console.log('[Team Profile] ℹ️ Authentication required. Redirecting to individual login...');
        setError('Please log in with your individual account to view your team profile.');
        setLoading(false);
        // Redirect after a short delay to show the message
        setTimeout(() => {
          router.push('/login?type=individual&next=/profile/team');
        }, 1500);
        return;
      }

      // STEP 3: Check for an optional team session (kept for compatibility but not required here)
      // No assignment to avoid "assigned but never used" lint warning; individual auth is primary.

      // STEP 4: Now that individual auth is confirmed, find the user's team by memberIds
      // At this point, user is guaranteed to be non-null because of the check above
      if (!user) {
        setError('Authentication error: Unable to retrieve user information.');
        setLoading(false);
        return;
      }

      // STEP 5: Get the user's custom userId from the users collection
      // The memberIds in teams collection store custom userId, not Appwrite account IDs
      console.log('[Team Profile] 🔍 Fetching user data from users collection with email:', user.email);
      
      let customUserId: string | null = null;
      try {
        const userDataResponse = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('email', user.email)]
        );
        
        if (userDataResponse.documents.length > 0) {
          const userData = userDataResponse.documents[0] as unknown as UserData;
          customUserId = userData.userId;
          setCurrentUserId(customUserId); // Set current user ID for "You" badge display
          console.log('[Team Profile] ✅ Found custom userId:', customUserId);
        } else {
          console.warn('[Team Profile] ⚠️ No user document found in users collection');
          setError('Your profile data was not found. Please contact the administrator.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('[Team Profile] Error fetching user data:', error);
        setError('Failed to retrieve your profile data.');
        setLoading(false);
        return;
      }

      // STEP 6: Search for teams using the custom userId
      console.log('[Team Profile] 🔍 Searching for teams with custom userId:', customUserId);
      console.log('[Team Profile] Using DATABASE_ID:', DATABASE_ID);
      console.log('[Team Profile] Using TEAMS_COLLECTION_ID:', TEAMS_COLLECTION_ID);
      
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [Query.equal('memberIds', customUserId)]
      );

      console.log('[Team Profile] Teams found:', teamsResponse.documents.length);
      console.log('[Team Profile] Teams response:', JSON.stringify(teamsResponse.documents, null, 2));

      if (teamsResponse.documents.length === 0) {
        setError('You are not assigned to any team. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Get the first team (primary team)
      const team = teamsResponse.documents[0] as unknown as TeamData;
      console.log('[Team Profile] ✅ Team data loaded:', {
        teamName: team.teamName,
        teamCode: team.teamCode,
        memberCount: team.memberIds?.length || 0
      });
      setTeamData(team);

      // Fetch detailed member information
      if (team.memberIds && team.memberIds.length > 0) {
        console.log('[Team Profile] Fetching details for', team.memberIds.length, 'members');
      
        // Fetch users by their Appwrite account IDs stored in memberIds
        const memberPromises = team.memberIds.map(async (memberId) => {
          try {
            // Try to find user document where userId matches the Appwrite account ID
            const userResponse = await databases.listDocuments(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              [Query.equal('userId', memberId)]
            );

            if (userResponse.documents.length > 0) {
              return userResponse.documents[0] as unknown as UserData;
            }
            
            // If not found by userId, might need to handle differently
            console.warn('[Team Profile] Could not find user data for member ID:', memberId);
            return null;
          } catch (error) {
            console.error('[Team Profile] Error fetching member:', memberId, error);
            return null;
          }
        });

        const memberResults = await Promise.all(memberPromises);
        const validMembers = memberResults.filter((m): m is UserData => m !== null);
        console.log('[Team Profile] Successfully loaded', validMembers.length, 'member details');
        setMembers(validMembers);
      }
      
      setLoading(false);

    } catch (error: unknown) {
      console.error('[Team Profile] Error:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to load team profile');
      } else {
        setError(String(error) || 'Failed to load team profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      console.log('Logged out successfully!');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err?.code === 401) {
        console.warn('Logout failed: Session already unauthorized or expired. Clearing client-side state.');
        // Even if the server says 401, for the client, the user is effectively logged out.
        router.push('/');
      } else {
        console.error('An unexpected error occurred during logout:', error);
        // For other errors, still redirect to clear the UI
        router.push('/');
      }
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading team profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('log in') || error.includes('individual account');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className={`bg-gray-800/80 backdrop-blur-xl border rounded-2xl p-8 text-center max-w-md ${
          isAuthError ? 'border-cyan-500/30' : 'border-red-500/30'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isAuthError ? 'bg-cyan-500/20' : 'bg-red-500/20'
          }`}>
            {isAuthError ? (
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isAuthError ? 'text-cyan-400' : 'text-red-400'
          }`}>
            {isAuthError ? 'Authentication Required' : 'Team Profile Error'}
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          {isAuthError ? (
            <div className="flex gap-3 justify-center">
              <Link
                href="/login?type=individual&next=/profile/team"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
              >
                Login Now
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Go Home
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
              >
                Go Home
              </Link>
              <button
                onClick={() => fetchTeamData()}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">No Team Found</h2>
          <p className="text-gray-300 mb-6">You are not assigned to any team yet.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
      suppressHydrationWarning
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-5xl mx-auto pt-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group"
            >
              <svg 
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Individual Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Team Header Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{teamData.teamName}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-purple-100 text-lg">Team Name</p>
                  {teamData.questionSetId && (
                    <span className="px-3 py-1 bg-purple-400/30 text-purple-100 rounded-full text-sm font-medium border border-purple-300/50">
                      📚 {teamData.questionSetId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div> 

          {/* Team Credentials Card */}
          <div className="bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 p-8 mb-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Team Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Code */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                <label className="text-sm text-cyan-400 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.574 1.239 1.574.829 0 1.489-.794 1.239-1.574L6.142 10.6a1 1 0 00-.95-.675H4a1 1 0 00-.95.675l-.818 2.552c-.25.78.409 1.574 1.239 1.574.829 0 1.489-.794 1.239-1.574L5 10.274z" clipRule="evenodd" />
                  </svg>
                  Team Code
                </label>
                <p className="text-white text-2xl font-bold font-mono tracking-wider">{teamData.teamCode}</p>
                <p className="text-gray-400 text-sm mt-2">Use this code to identify your team</p>
              </div>

              {/* Team Password */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                <label className="text-sm text-cyan-400 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Team Password
                </label>
                <p className="text-white text-2xl font-bold font-mono tracking-wider">{teamData.password}</p>
                <p className="text-gray-400 text-sm mt-2">Required for team login</p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-400 font-semibold mb-1">Keep These Credentials Secure</p>
                  <p className="text-gray-300 text-sm">Share team code and password only with your team members. Do not share publicly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Team Members
              <span className="text-sm font-normal text-gray-400 ml-2">({members.length} member{members.length !== 1 ? 's' : ''})</span>
            </h2>

            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => {
                  const isCurrentUser = member.userId === currentUserId;
                  return (
                    <div
                      key={member.$id}
                      className={`bg-gray-800/50 border rounded-lg p-5 transition-all hover:border-cyan-500/50 ${
                        isCurrentUser ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrentUser ? 'bg-cyan-500' : 'bg-gray-700'
                        }`}>
                          <span className="text-white font-bold text-lg">{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-lg truncate">{member.name}</h3>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">You</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span className="truncate">{member.email}</span>
                            </p>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              <span>{member.department}</span>
                            </p>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V3a1 1 0 011-1z" clipRule="evenodd" />
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" />
                                <path d="M7 7h6v2H7V7zm0 4h6v2H7v-2z" />
                              </svg>
                              <span className="font-mono text-xs">{member.userId}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No member details available</p>
                <p className="text-gray-500 text-sm mt-2">Member information could not be loaded</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-400 font-semibold mb-1">Team Profile Information</p>
                <p className="text-gray-300 text-sm">This page shows your team details and all team members. Use the team code and password for team-based login.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
