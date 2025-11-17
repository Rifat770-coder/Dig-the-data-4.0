// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Use native <img> for external Appwrite URLs to avoid Next.js image optimizer 500 errors
import { Models } from 'appwrite';
import { databases, DATABASE_ID, USERS_COLLECTION_ID, QUESTION_SET_COLLECTION_ID, getProfilePictureUrl, getBkashReceiptUrl } from '@/lib/appwrite';
import { Query } from 'appwrite';
import AuthModeToggle from '@/components/AuthModeToggle';
import { useAuthMode } from '@/lib/auth-context';
import { 
  createTeam, 
  getAllTeams, 
  deleteTeam, 
  updateTeam,
  Team,
  TeamValidationError
} from '@/lib/teams';


interface UserData extends Models.Document {
  name: string;
  email: string;
  userId: string;
  department: string;
  Phone: number;
  bkashTransactionId?: string;
  bkashTransactionPhotoId?: string;
  profilePictureId?: string;
  createdAt: string;
}

interface QuestionSet {
  $id: string;
  set: string;
  question: string[];
  correctAnswer: string;
  points: number;
  hint?: string[];
}

export default function AdminPage() {
  const { refreshAuthMode } = useAuthMode();
  const [users, setUsers] = useState<UserData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [outdoorQuestionSets, setOutdoorQuestionSets] = useState<{ $id: string; set: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof UserData>('createdAt');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Image modal state
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
  
  // Team management states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    teamCode: '',
    password: '',
    memberIds: [] as string[],
    questionSetId: '', // Legacy field
    indoorQuestionSetId: '', // Indoor question set
    outdoorQuestionSetId: '' // Outdoor question set
  });
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);
  
  // Search and filter states
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Admin password (in production, this should be environment variable)
  const ADMIN_PASSWORD = 'ncc-rifat';

  useEffect(() => {
    // Check if already authenticated
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      fetchUsers();
      fetchTeams();
      fetchQuestionSets();
      fetchOutdoorQuestionSets();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch question sets from Appwrite
  const fetchQuestionSets = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      
      console.log('Fetched question sets:', response.documents);
      
      // Extract unique set names from the 'set' field
      const uniqueSets = new Map<string, QuestionSet>();
      response.documents.forEach((doc) => {
        const setName = (doc.set as string || '').trim();
        if (setName && !uniqueSets.has(setName)) {
          uniqueSets.set(setName, {
            $id: doc.$id,
            set: setName,
            question: Array.isArray(doc.question) ? doc.question : [doc.question],
            correctAnswer: doc.correctAnswer as string,
            points: doc.points as number,
            hint: Array.isArray(doc.hint) ? doc.hint : doc.hint ? [doc.hint] : []
          } as QuestionSet);
        }
      });
      
      const uniqueSetArray = Array.from(uniqueSets.values());
      console.log('Unique question sets:', uniqueSetArray);
      setQuestionSets(uniqueSetArray);
    } catch (err) {
      console.error('Error fetching question sets:', err);
      setQuestionSets([]);
    }
  };

  // Fetch outdoor question sets from Appwrite
  const fetchOutdoorQuestionSets = async () => {
    try {
      const OUTDOOR_COLLECTION_ID = 'outdoor';
      const response = await databases.listDocuments(
        DATABASE_ID,
        OUTDOOR_COLLECTION_ID,
        [Query.orderAsc('$createdAt')]
      );
      
      console.log('Fetched outdoor question sets:', response.documents);
      
      // Extract unique set names from the 'set' field
      const uniqueSets = new Map<string, { $id: string; set: string }>();
      response.documents.forEach((doc) => {
        const setName = (doc.set as string || '').trim();
        if (setName && !uniqueSets.has(setName)) {
          uniqueSets.set(setName, {
            $id: doc.$id,
            set: setName
          });
        }
      });
      
      const uniqueSetArray = Array.from(uniqueSets.values());
      console.log('Unique outdoor question sets:', uniqueSetArray);
      setOutdoorQuestionSets(uniqueSetArray);
    } catch (err) {
      console.error('Error fetching outdoor question sets:', err);
      setOutdoorQuestionSets([]);
    }
  };

  // Team management functions
  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      const teamsData = await getAllTeams();
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setTeams([]); // Ensure teams is always an array
      setTeamError('Failed to fetch teams');
    } finally {
      setTeamsLoading(false);
    }
  };



  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);
    setTeamSuccess(null);

    try {
      await createTeam({
        teamName: teamForm.teamName,
        teamCode: teamForm.teamCode,
        password: teamForm.password,
        memberIds: teamForm.memberIds,
        questionSetId: teamForm.questionSetId, // Legacy field
        indoorQuestionSetId: teamForm.indoorQuestionSetId,
        outdoorQuestionSetId: teamForm.outdoorQuestionSetId
      });

      setTeamSuccess('Team created successfully!');
      setShowCreateTeam(false);
      setTeamForm({ 
        teamName: '', 
        teamCode: '', 
        password: '', 
        memberIds: [], 
        questionSetId: '',
        indoorQuestionSetId: '',
        outdoorQuestionSetId: ''
      });
      fetchTeams();
      fetchUsers(); // Refresh users to update their team assignments
    } catch (err) {
      if (err instanceof TeamValidationError) {
        setTeamError(err.message);
      } else {
        setTeamError('Failed to create team');
      }
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.$id) return;

    setTeamError(null);
    setTeamSuccess(null);

    try {
      await updateTeam(editingTeam.$id, {
        teamName: teamForm.teamName,
        teamCode: teamForm.teamCode,
        password: teamForm.password,
        memberIds: teamForm.memberIds,
        questionSetId: teamForm.questionSetId, // Legacy field
        indoorQuestionSetId: teamForm.indoorQuestionSetId,
        outdoorQuestionSetId: teamForm.outdoorQuestionSetId
      });

      setTeamSuccess('Team updated successfully!');
      setEditingTeam(null);
      setTeamForm({ 
        teamName: '', 
        teamCode: '', 
        password: '', 
        memberIds: [], 
        questionSetId: '',
        indoorQuestionSetId: '',
        outdoorQuestionSetId: ''
      });
      fetchTeams();
      fetchUsers();
    } catch (err) {
      if (err instanceof TeamValidationError) {
        setTeamError(err.message);
      } else {
        setTeamError('Failed to update team');
      }
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This will remove all members from the team.')) {
      return;
    }

    try {
      await deleteTeam(teamId);
      setTeamSuccess('Team deleted successfully!');
      fetchTeams();
      fetchUsers();
    } catch (error) {
      console.error('Error deleting team:', error);
      setTeamError('Failed to delete team');
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Fetch all users (set limit to 1000 to get all users, default is 25)
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      const allUsers = response.documents as unknown as UserData[];
      
      // Get all assigned user IDs from other teams (excluding current editing team)
      const assignedUserIds = new Set<string>();
      teams.forEach(team => {
        // Skip the team we're currently editing
        if (editingTeam && team.$id === editingTeam.$id) {
          return;
        }
        // Add all member IDs from other teams
        if (team.memberIds && Array.isArray(team.memberIds)) {
          team.memberIds.forEach(id => assignedUserIds.add(id));
        }
      });
      
      // When editing, include current team members in available users
      // They should appear as selectable so they can be removed or kept
      let currentTeamMemberIds = new Set<string>();
      if (editingTeam && editingTeam.memberIds && Array.isArray(editingTeam.memberIds)) {
        currentTeamMemberIds = new Set(editingTeam.memberIds);
      }
      
      // Filter: show users that are either (a) not assigned to any team, 
      // or (b) are members of the team being edited
      const availableUsers = allUsers.filter(user => 
        !assignedUserIds.has(user.userId) || currentTeamMemberIds.has(user.userId)
      );
      
      setAvailableUsers(availableUsers);
    } catch (err) {
      console.error('Error fetching available users:', err);
      setAvailableUsers([]);
      setTeamError('Failed to fetch available users');
    }
  };

  const startEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      teamName: team.teamName,
      teamCode: team.teamCode,
      password: team.password,
      memberIds: team.memberIds || [], // Load existing members
      questionSetId: team.questionSetId || '', // Legacy field
      indoorQuestionSetId: team.indoorQuestionSetId || '',
      outdoorQuestionSetId: team.outdoorQuestionSetId || ''
    });
    setShowCreateTeam(true);
    fetchAvailableUsers();
  };

  const cancelTeamForm = () => {
    setShowCreateTeam(false);
    setEditingTeam(null);
    setTeamForm({ 
      teamName: '', 
      teamCode: '', 
      password: '', 
      memberIds: [], 
      questionSetId: '',
      indoorQuestionSetId: '',
      outdoorQuestionSetId: ''
    });
    setTeamError(null);
  };

  const toggleMemberSelection = (userId: string) => {
    setTeamForm(prev => {
      const memberIds = prev?.memberIds || [];
      const isSelected = memberIds.includes(userId);
      if (isSelected) {
        return { ...prev, memberIds: memberIds.filter(id => id !== userId) };
      } else {
        // No limit on member count for now
        return { ...prev, memberIds: [...memberIds, userId] };
      }
    });
  };

  // Filter and search functions
  const getFilteredUsers = () => {
    if (!users || !Array.isArray(users)) return [];
    return users.filter(user => {
      const matchesSearch = userSearchTerm === '' || 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.userId.toLowerCase().includes(userSearchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === '' || 
        user.department.toLowerCase().includes(departmentFilter.toLowerCase());
      
      return matchesSearch && matchesDepartment;
    });
  };

  const getFilteredTeams = () => {
    if (!teams || !Array.isArray(teams)) return [];
    return teams.filter(team => {
      if (!team) return false;
      
      const matchesSearch = teamSearchTerm === '' ||
        (team.teamName && team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase())) ||
        (team.teamCode && team.teamCode.toLowerCase().includes(teamSearchTerm.toLowerCase()));
      
      // All teams are now "complete" in the new schema (no member management)
      return matchesSearch;
    });
  };

  const getUniqueDepartments = () => {
    if (!users || !Array.isArray(users)) return [];
    const departments = users.map(user => user.department).filter(Boolean);
    return [...new Set(departments)].sort();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('adminAuthenticated', 'true');
      fetchUsers();
    } else {
      setAuthError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setUsers([]);
    setPassword('');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        throw new Error('Appwrite configuration is missing. Please check your environment variables.');
      }
      
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.limit(1000)] // Fetch up to 1000 users (default is 25)
        );
        
        setUsers(response.documents as unknown as UserData[]);
        setError(null);
      } catch (collectionError: unknown) {
        // Handle collection not found error specifically
        const error = collectionError as { code?: number; message?: string };
        if (error?.code === 404 || error?.message?.includes('Collection')) {
          console.warn('Users collection not found in Appwrite. This is expected during initial setup.');
          setUsers([]);
          setError('Users collection not found. This is normal during initial setup. Users will appear here once they start registering.');
          return;
        }
        throw collectionError;
      }
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      
      let errorMessage = 'Failed to fetch users';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the database. Please check your internet connection and try again.';
        } else if (err.message.includes('Unauthorized')) {
          errorMessage = 'Authentication error: Invalid credentials or expired session.';
        } else if (err.message.includes('Not Found') || err.message.includes('Collection')) {
          errorMessage = 'Database error: Collection not found. Please check your database configuration.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
      
      // Remove from local state
      setUsers(users.filter(user => user.$id !== userId));
      alert('User deleted successfully!');
    } catch (err: unknown) {
      console.error('Error deleting user:', err);
      
      // Handle collection not found error specifically
      const error = err as { code?: number; message?: string };
      if (error?.code === 404 && error?.message?.includes('Collection')) {
        alert('Cannot delete user: Users collection not found. This is expected during initial setup.');
        return;
      }
      
      alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const exportToPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Registration Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0891b2; margin-bottom: 5px; }
          .header p { color: #6b7280; margin: 5px 0; }
          .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat { text-align: center; }
          .stat h3 { color: #0891b2; margin: 0; }
          .stat p { color: #374151; margin: 5px 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .department { background-color: #e0f2fe; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dig The Data - User Registration Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <h3>Total Users</h3>
            <p>${users?.length || 0}</p>
          </div>
          <div class="stat">
            <h3>New Today</h3>
            <p>${(users || []).filter(user => {
              const today = new Date().toDateString();
              const userDate = new Date(user.createdAt).toDateString();
              return today === userDate;
            }).length}</p>
          </div>
          <div class="stat">
            <h3>Departments</h3>
            <p>${new Set((users || []).map(user => user.department)).size}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>User ID</th>
              <th>Department</th>
             
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedUsers.map((user, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.userId}</td>
                <td><span class="department">${user.department}</span></td>
               
                <td>${new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  };

  // Filter and search users
  const filteredAndSortedUsers = getFilteredUsers()
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (!aVal || !bVal) return 0;
      
      // Sort in descending order by default (newest first)
      return aVal < bVal ? 1 : -1;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Admin Access
            </h1>
            <p className="text-gray-300">Enter password to access admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 pr-12"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
            </div>

            {authError && (
              <div className="p-4 rounded-lg border bg-red-900/30 text-red-300 border-red-500/30">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>

         
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage registered users</p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/admin/leaderboard"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              🏆 Leaderboard
            </Link>
            <Link
              href="/admin/indoor-questions"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Indoor Questions
            </Link>
            <Link
              href="/admin/outdoor-questions"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-400 hover:to-orange-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Outdoor Questions
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={() => {
                fetchUsers();
                refreshAuthMode();
              }}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Authentication Mode Control */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Mode Control</h2>
            <p className="text-gray-400 text-sm mb-6 text-center max-w-2xl">
              Toggle between registration mode (for individual user registration) and team login mode (for team-based access).
              This setting affects the entire application&apos;s authentication flow.
            </p>
            <AuthModeToggle 
              size="lg" 
              onModeChange={(mode) => {
                console.log('Auth mode changed to:', mode);
                // Optionally refresh users or update UI based on mode change
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-white mt-2">{users?.length || 0}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">New Today</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {users && Array.isArray(users) ? users.filter(user => {
                const today = new Date().toDateString();
                const userDate = new Date(user.createdAt).toDateString();
                return today === userDate;
              }).length : 0}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">Departments</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {users && Array.isArray(users) ? new Set(users.map(user => user.department)).size : 0}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-1 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Users ({users?.length || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Teams ({teams?.length || 0})
              </div>
            </button>
          </div>
        </div>

        {/* Team Management Section */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Team Actions Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Team Management</h2>
                <p className="text-gray-400">Create and manage team login credentials</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateTeam(true);
                  fetchAvailableUsers();
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-400 hover:to-emerald-400 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Team
              </button>
            </div>

            {/* Success/Error Messages */}
            {teamSuccess && (
              <div className="p-4 rounded-lg border bg-green-900/30 text-green-300 border-green-500/30">
                {teamSuccess}
              </div>
            )}
            {teamError && (
              <div className="p-4 rounded-lg border bg-red-900/30 text-red-300 border-red-500/30">
                {teamError}
              </div>
            )}

            {/* Team Search and Filter Controls */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search Teams</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Search Teams</label>
                  <input
                    type="text"
                    placeholder="Search by team name or code..."
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400"
                  />
                </div>
              </div>
              
              {/* Filter Results Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {getFilteredTeams().length} of {teams?.length || 0} teams
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTeamSearchTerm('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            {teamsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading teams...</p>
              </div>
            ) : getFilteredTeams().length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {teamSearchTerm ? 'No Teams Match Your Search' : 'No Teams Created'}
                </h3>
                <p className="text-gray-500">
                  {teamSearchTerm ? 'Try adjusting your search criteria' : 'Create your first team to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredTeams().map((team) => (
                  <div key={team.$id} className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{team.teamName}</h3>
                        <p className="text-cyan-400 font-mono text-sm">Code: {team.teamCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditTeam(team)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Team"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => team.$id && handleDeleteTeam(team.$id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Team"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Team Code:</span>
                        <span className="text-cyan-400 font-mono font-semibold">{team.teamCode}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Indoor:
                        </span>
                        <span className="text-cyan-400 font-medium text-sm">
                          {team.indoorQuestionSetId || 'All Indoor'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Outdoor:
                        </span>
                        <span className="text-orange-400 font-medium text-sm">
                          {team.outdoorQuestionSetId || 'All Outdoor'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Created:</span>
                        <span className="text-gray-300 text-sm">{team.$createdAt ? new Date(team.$createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Last Updated:</span>
                        <span className="text-gray-300 text-sm">{team.$updatedAt ? new Date(team.$updatedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm text-gray-300">Members:</span>
                          </div>
                          <span className="text-cyan-400 font-semibold">{team.memberIds?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-300">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Enhanced Search and Filter Controls */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search & Filter Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Search Users</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  >
                    <option value="">All Departments</option>
                    {getUniqueDepartments().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as keyof UserData)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  >
                    <option value="createdAt">Registration Date</option>
                    <option value="name">Name</option>
                    <option value="department">Department</option>
                    <option value="userId">User ID</option>
                  </select>
                </div>
              </div>
              
              {/* Filter Results Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {getFilteredUsers().length} of {users && Array.isArray(users) ? users.length : 0} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUserSearchTerm('');
                      setDepartmentFilter('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left p-4 text-cyan-400 font-medium">#</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Profile</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Name</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Email</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">User ID</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Department</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Phone</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">bKash Receipt</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Registered</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-400">
                      {userSearchTerm || departmentFilter ? 'No users found matching your filters.' : 'No users registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user, index) => (
                    <tr key={user.$id} className="border-t border-gray-700 hover:bg-gray-700/30">
                      <td className="p-4 text-gray-300">{index + 1}</td>
                      
                      {/* Profile Picture (thumbnail) - use native img to avoid Next.js optimizer */}
                      <td className="p-4">
                        {(() => {
                          const pictureUrl = user.profilePictureId ? getProfilePictureUrl(user.profilePictureId) : undefined;
                          if (pictureUrl) {
                            return (
                              <button
                                onClick={() => setViewingImage({
                                  url: pictureUrl,
                                  title: `${user.name}'s Profile Picture`
                                })}
                                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/50 hover:border-cyan-400 transition-all hover:scale-110 cursor-pointer group"
                              >
                                {/* Use native img for Appwrite / external URLs */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pictureUrl}
                                  alt={`${user.name}'s profile`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </button>
                            );
                          }
                          
                          return (
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          );
                        })()}
                      </td>
                      
                      <td className="p-4 text-white font-medium">{user.name}</td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4 text-gray-300">{user.userId}</td>
                      <td className="p-4 text-gray-300">
                        <span className="px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded-full text-xs">
                          {user.department}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{user.Phone}</td>
                      
                      {/* bKash Receipt (thumbnail) - use native img for Appwrite URLs */}
                      <td className="p-4">
                        {(() => {
                          const receiptUrl = user.bkashTransactionPhotoId ? getBkashReceiptUrl(user.bkashTransactionPhotoId) : undefined;
                          if (receiptUrl) {
                            return (
                              <button
                                onClick={() => setViewingImage({
                                  url: receiptUrl,
                                  title: `${user.name}'s bKash Receipt`
                                })}
                                className="relative w-16 h-12 rounded overflow-hidden border-2 border-cyan-500/50 hover:border-cyan-400 transition-all group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={receiptUrl}
                                  alt={`${user.name}'s bKash receipt`}
                                  width={64}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </button>
                            );
                          }
                          if (user.bkashTransactionId) {
                            return (
                              <span className="text-gray-400 text-xs font-mono bg-gray-700/50 px-2 py-1 rounded">
                                {user.bkashTransactionId}
                              </span>
                            );
                          }
                          return <span className="text-gray-500 text-xs">No receipt</span>;
                        })()}
                      </td>
                      
                      <td className="p-4 text-gray-300 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteUser(user.$id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400">
          <p>Showing {filteredAndSortedUsers.length} of {users && Array.isArray(users) ? users.length : 0} users</p>
        </div>
      </div>
        )}
      </div>

      {/* Team Creation/Edit Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-cyan-500/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h2>
              <button
                onClick={cancelTeamForm}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="space-y-6">
              {/* Team Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamForm?.teamName || ''}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400"
                    placeholder="Enter team name"
                    required
                    minLength={3}
                    maxLength={128}
                  />
                  <p className="text-xs text-gray-400 mt-1">3-128 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Team Code *
                  </label>
                  <input
                    type="text"
                    value={teamForm?.teamCode || ''}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, teamCode: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 font-mono"
                    placeholder="TEAM01"
                    required
                    minLength={4}
                    maxLength={25}
                    pattern="[A-Z0-9]+"
                  />
                  <p className="text-xs text-gray-400 mt-1">Alphanumeric characters only, 4-25 characters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={teamForm?.password || ''}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400"
                  placeholder="Enter team password"
                  required
                  minLength={8}
                  maxLength={30}
                />
                <p className="text-xs text-gray-400 mt-1">8-30 characters - This will be used for team login</p>
              </div>

              {/* Indoor Question Set Selection */}
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Indoor Question Set (Optional)
                  </span>
                </label>
                <select
                  value={teamForm?.indoorQuestionSetId || ''}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, indoorQuestionSetId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                >
                  <option value="">All Indoor Questions (No specific set)</option>
                  {questionSets.length > 0 ? (
                    questionSets.map((set) => (
                      <option key={set.$id} value={set.set}>
                        {set.set}
                      </option>
                    ))
                  ) : (
                    <option disabled>No indoor question sets found - Add questions first</option>
                  )}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {questionSets.length > 0 
                    ? `Select which indoor question set this team will see (${questionSets.length} set${questionSets.length !== 1 ? 's' : ''} available)` 
                    : 'Add indoor questions in the Indoor Questions page to create sets'}
                </p>
              </div>

              {/* Outdoor Question Set Selection */}
              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Outdoor Question Set (Optional)
                  </span>
                </label>
                <select
                  value={teamForm?.outdoorQuestionSetId || ''}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, outdoorQuestionSetId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                >
                  <option value="">All Outdoor Questions (No specific set)</option>
                  {outdoorQuestionSets.length > 0 ? (
                    outdoorQuestionSets.map((set) => (
                      <option key={set.$id} value={set.set}>
                        {set.set}
                      </option>
                    ))
                  ) : (
                    <option disabled>No outdoor question sets found - Add questions first</option>
                  )}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {outdoorQuestionSets.length > 0 
                    ? `Select which outdoor question set this team will see (${outdoorQuestionSets.length} set${outdoorQuestionSets.length !== 1 ? 's' : ''} available)` 
                    : 'Add outdoor questions in the Outdoor Questions page to create sets'}
                </p>
              </div>

              {/* Currently Assigned Members Section */}
              {teamForm?.memberIds && teamForm.memberIds.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-cyan-300">
                      Currently Assigned Team Members ({teamForm.memberIds.length})
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    {users
                      .filter(user => teamForm.memberIds.includes(user.userId))
                      .map((user) => (
                        <div
                          key={user.$id}
                          className="p-4 rounded-lg border bg-cyan-500/20 border-cyan-500/50 text-cyan-300 relative"
                        >
                          <button
                            type="button"
                            onClick={() => toggleMemberSelection(user.userId)}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                            title="Remove from team"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="flex items-center gap-3 pr-6">
                            <div className="w-5 h-5 rounded border-2 bg-cyan-500 border-cyan-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs opacity-75 truncate">{user.email}</p>
                              <p className="text-xs opacity-60">{user.department}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {users.filter(user => teamForm.memberIds.includes(user.userId)).length === 0 && (
                      <div className="col-span-full text-center py-4 text-gray-400">
                        <p className="text-sm">Member details loading... ({teamForm.memberIds.length} member IDs assigned)</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Click the ✕ button to remove a member from this team
                  </p>
                </div>
              )}

              {/* Member Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-cyan-300">
                    {teamForm?.memberIds && teamForm.memberIds.length > 0 ? 'Add More Team Members' : 'Select Team Members'} 
                    {!teamForm?.memberIds || teamForm.memberIds.length === 0 ? ` (${teamForm?.memberIds?.length || 0} selected)` : ''}
                  </label>
                </div>

                {!availableUsers || !Array.isArray(availableUsers) || availableUsers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-400 font-medium mb-1">No available users to add</p>
                    <p className="text-gray-500 text-sm">
                      {teamForm?.memberIds?.length ? 
                        'All available users are already assigned. Your current team members are saved.' : 
                        'All users are already assigned to other teams'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 bg-gray-700/20 rounded-lg border border-gray-600/50">
                    {availableUsers
                      .filter(user => !teamForm?.memberIds?.includes(user.userId))
                      .map((user) => {
                      // Show only users that are NOT already selected
                      
                      return (
                        <div
                          key={user.$id}
                          className="p-4 rounded-lg border cursor-pointer transition-all duration-300 bg-gray-600/30 border-gray-500/50 text-gray-300 hover:bg-gray-600/50 hover:border-cyan-400/50"
                          onClick={() => toggleMemberSelection(user.userId)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs opacity-75 truncate">{user.email}</p>
                              <p className="text-xs opacity-60">{user.department}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show currently selected members count and info */}
                {teamForm?.memberIds?.length > 0 && availableUsers.length === 0 && (
                  <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-sm text-cyan-300">
                      <span className="font-semibold">{teamForm.memberIds.length} member{teamForm.memberIds.length !== 1 ? 's' : ''}</span> currently assigned to this team
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No additional users available to add at this time
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {availableUsers.filter(user => !teamForm?.memberIds?.includes(user.userId)).length > 0 ? 
                    'Click on users to add them as team members' : 
                    teamForm?.memberIds?.length > 0 ?
                    'All available users have been added. Use the section above to remove members if needed.' :
                    'No users available to add'}
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={cancelTeamForm}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!teamForm?.teamName || !teamForm?.teamCode || !teamForm?.password}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal (renders native img to avoid optimizer) */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

              <Image
                src={viewingImage.url}
                alt={viewingImage.title}
                width={1600}
                height={900}
                className="max-h-[90%] max-w-[100%] object-contain"
                unoptimized
              />
            {/* Image Container */}
            <div className="w-full h-[70vh] bg-gray-900 rounded-lg overflow-auto border-2 border-cyan-500/50 flex items-center justify-center">
              <Image
                src={viewingImage.url}
                alt={viewingImage.title}
                width={1600}
                height={900}
                className="max-h-[90%] max-w-[100%] object-contain"
                unoptimized
              />
            </div>

            {/* Download Button */}
            <div className="mt-4 text-center">
              <a
                href={viewingImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
