// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Use native <img> for external Appwrite URLs to avoid Next.js image optimizer 500 errors
import { Models } from 'appwrite';
import { databases, DATABASE_ID, USERS_COLLECTION_ID, getProfilePictureUrl, getBkashReceiptUrl } from '@/lib/appwrite';

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

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof UserData>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Image modal state
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);

  // Admin password (in production, this should be environment variable)
  const ADMIN_PASSWORD = 'nccrifat';

  useEffect(() => {
    // Check if already authenticated
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, []);

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
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      
      setUsers(response.documents as unknown as UserData[]);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      
      let errorMessage = 'Failed to fetch users';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the database. Please check your internet connection and try again.';
        } else if (err.message.includes('Unauthorized')) {
          errorMessage = 'Authentication error: Invalid credentials or expired session.';
        } else if (err.message.includes('Not Found')) {
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
            <p>${users.length}</p>
          </div>
          <div class="stat">
            <h3>New Today</h3>
            <p>${users.filter(user => {
              const today = new Date().toDateString();
              const userDate = new Date(user.createdAt).toDateString();
              return today === userDate;
            }).length}</p>
          </div>
          <div class="stat">
            <h3>Departments</h3>
            <p>${new Set(users.map(user => user.department)).size}</p>
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
              <th>Phone</th>
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
                <td>${user.Phone}</td>
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

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.bkashTransactionId && user.bkashTransactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (!aVal || !bVal) return 0;
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
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
          
          <div className="flex gap-4">
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
              onClick={fetchUsers}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">New Today</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {users.filter(user => {
                const today = new Date().toDateString();
                const userDate = new Date(user.createdAt).toDateString();
                return today === userDate;
              }).length}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 text-sm font-medium">Departments</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {new Set(users.map(user => user.department)).size}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as keyof UserData)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="department">Sort by Department</option>
                <option value="userId">Sort by ID</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
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
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user, index) => (
                    <tr key={user.$id} className="border-t border-gray-700 hover:bg-gray-700/30">
                      <td className="p-4 text-gray-300">{index + 1}</td>
                      
                      {/* Profile Picture (thumbnail) - use native img to avoid Next.js optimizer */}
                      <td className="p-4">
                        {user.profilePictureId ? (
                          (() => {
                            const pictureUrl = getProfilePictureUrl(user.profilePictureId);
                            return pictureUrl ? (
                              <button
                                onClick={() => setViewingImage({ 
                                  url: pictureUrl, 
                                  title: `${user.name}'s Profile Picture` 
                                })}
                                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/50 hover:border-cyan-400 transition-all hover:scale-110 cursor-pointer group"
                              >
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
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
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
                        {user.bkashTransactionPhotoId ? (
                          (() => {
                            const receiptUrl = getBkashReceiptUrl(user.bkashTransactionPhotoId);
                            return receiptUrl ? (
                              <button
                                onClick={() => setViewingImage({ 
                                  url: receiptUrl, 
                                  title: `${user.name}'s bKash Receipt` 
                                })}
                                className="relative w-16 h-12 rounded overflow-hidden border-2 border-green-500/50 hover:border-green-400 transition-all hover:scale-110 cursor-pointer group"
                              >
                                <img
                                  src={receiptUrl}
                                  alt={`${user.name}'s bKash receipt`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs">Invalid receipt</span>
                            );
                          })()
                        ) : user.bkashTransactionId ? (
                          <span className="text-gray-400 text-xs font-mono bg-gray-700/50 px-2 py-1 rounded">
                            {user.bkashTransactionId}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">No receipt</span>
                        )}
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
          <p>Showing {filteredAndSortedUsers.length} of {users.length} users</p>
        </div>
      </div>

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

            {/* Image Title */}
            <div className="mb-4 text-center">
              <h3 className="text-2xl font-bold text-white">{viewingImage.title}</h3>
            </div>

            {/* Image Container */}
            <div className="w-full h-[70vh] bg-gray-900 rounded-lg overflow-auto border-2 border-cyan-500/50 flex items-center justify-center">
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                className="max-h-[90%] max-w-[100%] object-contain"
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
