'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamSession, isTeamSessionValid, clearTeamSession } from '@/lib/auth-api';
import { getTeamByCode, Team } from '@/lib/teams';
import { databases, DATABASE_ID, USERS_COLLECTION_ID, getProfilePictureUrl } from '@/lib/appwrite';

interface TeamSession {
  sessionId: string;
  teamName: string;
  teamCode: string;
  loginTime: string;
  expiresAt: string;
}

interface UserData {
  $id: string;
  name: string;
  email: string;
  userId: string;
  department?: string;
  profilePictureId?: string;
  createdAt?: string;
}

export default function TeamDashboard() {
  const [teamSession, setTeamSession] = useState<TeamSession | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        setLoading(true);

        // Check if user has valid team session
        if (!isTeamSessionValid()) {
          router.push('/login');
          return;
        }

        // Get team session data
        const session = getTeamSession();
        if (!session) {
          router.push('/login');
          return;
        }

        setTeamSession(session);

        // Fetch team details
        const teamData = await getTeamByCode(session.teamCode);
        if (!teamData) {
          throw new Error('Team not found');
        }
        setTeam(teamData);

        // Fetch team members
        await loadTeamMembers(teamData.memberIds ?? []);
      } catch (err) {
        console.error('Error loading team data:', err);
        clearTeamSession();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      checkAuthAndLoadData();
    }
  }, [mounted, router]);

  const loadTeamMembers = async (memberIds: string[]) => {
    try {
      if (!memberIds || memberIds.length === 0) {
        console.log('[Team Dashboard] No memberIds provided');
        setTeamMembers([]);
        return;
      }

      console.log('[Team Dashboard] Loading members for userIds:', memberIds);

      const { Query } = await import('appwrite');
      
      const memberPromises = memberIds.map(async (userId) => {
        try {
          // Search for user document by custom userId field (not $id)
          const userResponse = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('userId', userId)]
          );

          if (userResponse.documents.length > 0) {
            console.log('[Team Dashboard] ✅ Found user:', userId);
            return userResponse.documents[0] as unknown as UserData;
          }
          
          console.warn('[Team Dashboard] ⚠️ Could not find user with userId:', userId);
          return null;
        } catch (error) {
          console.error('[Team Dashboard] ❌ Error fetching member:', userId, error);
          return null;
        }
      });

      const members = await Promise.all(memberPromises);
      const validMembers = members.filter((member): member is UserData => member !== null);
      
      console.log('[Team Dashboard] ✅ Loaded', validMembers.length, 'of', memberIds.length, 'members');
      setTeamMembers(validMembers);
    } catch (error) {
      console.error('[Team Dashboard] Error loading team members:', error);
      setTeamMembers([]);
    }
  };

  const handleLogout = () => {
    clearTeamSession();
    router.push('/login');
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Dig The Data
            </h1>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Team Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome {teamSession?.teamName}
          </h1>
          <p className="text-gray-400 text-lg">
            Team Code: <span className="text-cyan-400 font-mono">{teamSession?.teamCode}</span>
          </p>
        </div>

        {/* Hello Team Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Hello Team</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Welcome to your team dashboard! Here you can collaborate, track progress, and stay connected with your team members. 
                Your session is active and will expire on{' '}
               
              </p>
              
              {/* Enter Game Button - Prominent CTA */}
              <div className="flex justify-center">
                <a 
                  href="/game-interface" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Enter The Game
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Meet Your Team Members Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Meet Your Team Members</h2>
          
          {team && (
            <div className="bg-gray-800/30 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Team: {team.teamName}</h3>
                <p className="text-cyan-400 mb-2">Code: {team.teamCode}</p>
               
          
              </div>
            </div>
          )}
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading team members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.$id}
                  className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {member.profilePictureId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getProfilePictureUrl(member.profilePictureId) || undefined}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-2 border-cyan-500/30 group-hover:border-cyan-500/60 group-hover:scale-105 transition-all duration-300"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform duration-300 ${member.profilePictureId ? 'hidden' : 'flex'}`}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    
                    {/* Member Info */}
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-cyan-400 font-medium mb-1">
                      {member.department || 'Team Member'}
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      {member.email}
                    </p>
                    
                  
                    
                   
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Team Stats */}
          {teamMembers.length > 0 && (
            <div className="mt-8 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{teamMembers.length}</div>
                  <div className="text-gray-400 text-sm">Team Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{team?.teamCode || 'N/A'}</div>
                  <div className="text-gray-400 text-sm">Team Code</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">Active</div>
                  <div className="text-gray-400 text-sm">Status</div>
                </div>
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
}