'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { account, databases, storage, DATABASE_ID, USERS_COLLECTION_ID, PROFILE_PICTURES_BUCKET_ID, BKASH_RECEIPTS_BUCKET_ID, getProfilePictureUrl, getBkashReceiptUrl } from '@/lib/appwrite';
import { Models, Query, ID } from 'appwrite';

interface UserData {
  name: string;
  email: string;
  userId: string;
  department: string;
  Phone: number;
  bkashTransactionPhotoId?: string;
  createdAt: string;
  profilePictureId?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [bkashReceiptUrl, setBkashReceiptUrl] = useState<string | null>(null);
  const [uploadingNewPicture, setUploadingNewPicture] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUserData();
    }
  }, [mounted]);

  // Add a function to refresh profile data
  const refreshProfile = () => {
    setLoading(true);
    fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      // Get current logged-in user
      const currentUser = await account.get();
      setUser(currentUser);

      // Clear previous data to prevent stale state
      setUserData(null);
      setProfilePictureUrl(null);
      setBkashReceiptUrl(null);

      // Fetch user data from database using email
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', currentUser.email)]
      );

      if (response.documents.length > 0) {
        const data = response.documents[0] as unknown as UserData;
        const docId = (response.documents[0] as { $id: string }).$id;
        setUserData(data);
        setDocumentId(docId);
        
        // Load profile picture if available
        if (data.profilePictureId) {
          const pictureUrl = getProfilePictureUrl(data.profilePictureId);
          setProfilePictureUrl(pictureUrl);
        }

        // Load bKash receipt if available
        if (data.bkashTransactionPhotoId) {
          const receiptUrl = getBkashReceiptUrl(data.bkashTransactionPhotoId);
          setBkashReceiptUrl(receiptUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If not authenticated, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData || !documentId) return;

    // Validate file - using only standard MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (jpeg, png, gif, webp)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingNewPicture(true);

      // Delete old picture if exists
      if (userData.profilePictureId) {
        try {
          await storage.deleteFile(PROFILE_PICTURES_BUCKET_ID, userData.profilePictureId);
        } catch (deleteError) {
          console.error('Error deleting old picture:', deleteError);
        }
      }

      // Upload new picture
      const fileUpload = await storage.createFile(
        PROFILE_PICTURES_BUCKET_ID,
        ID.unique(),
        file
      );

      // Update database with new picture ID
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        {
          profilePictureId: fileUpload.$id
        }
      );

      // Update UI
      const newPictureUrl = getProfilePictureUrl(fileUpload.$id);
      setProfilePictureUrl(newPictureUrl);
      setUserData({ ...userData, profilePictureId: fileUpload.$id });

      alert('Profile picture updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture. Please try again.');
    } finally {
      setUploadingNewPicture(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all state before logout
      setUser(null);
      setUserData(null);
      setProfilePictureUrl(null);
      setBkashReceiptUrl(null);
      setDocumentId(null);
      
      await account.deleteSession('current');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Profile Not Found</h2>
          <p className="text-gray-300 mb-6">We couldn&apos;tfind your profile data.</p>
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
        <div className="max-w-4xl mx-auto pt-8">
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
              <button
                onClick={refreshProfile}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh profile data"
              >
                <svg 
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                {profilePictureUrl ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={profilePictureUrl}
                      alt={`${userData.name}'s profile`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Update Picture Button */}
                <label
                  htmlFor="updateProfilePicture"
                  className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-700 transition-colors shadow-lg border-2 border-white opacity-0 group-hover:opacity-100"
                  title="Update profile picture"
                >
                  {uploadingNewPicture ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </label>
                <input
                  type="file"
                  id="updateProfilePicture"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpdate}
                  className="hidden"
                  disabled={uploadingNewPicture}
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{userData.name}</h1>
              <p className="text-cyan-100">{userData.email}</p>
            </div>

            {/* Profile Details */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-cyan-400 font-medium mb-2 block">User ID</label>
                  <p className="text-white text-lg font-semibold">{userData.userId}</p>
                </div>

                {/* Department */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-cyan-400 font-medium mb-2 block">Department</label>
                  <p className="text-white text-lg font-semibold">{userData.department}</p>
                </div>

                {/* Phone */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-cyan-400 font-medium mb-2 block">Phone Number</label>
                  <p className="text-white text-lg font-semibold">{userData.Phone}</p>
                </div>

                {/* bKash Transaction Screenshot */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <label className="text-sm text-cyan-400 font-medium mb-2 block">bKash Transaction Screenshot</label>
                  {bkashReceiptUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-cyan-500/30 cursor-pointer group"
                         onClick={() => window.open(bkashReceiptUrl, '_blank')}>
                      <Image
                        src={bkashReceiptUrl}
                        alt="bKash transaction receipt"
                        fill
                        className="object-contain bg-gray-900 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No receipt uploaded</p>
                  )}
                </div>

                {/* Registration Date */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:col-span-2">
                  <label className="text-sm text-cyan-400 font-medium mb-2 block">Registered On</label>
                  <p className="text-white text-lg font-semibold">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-400 text-xl font-bold">Registration Confirmed</span>
                </div>
                <p className="text-gray-300">Your registration for Dig The Data has been successfully confirmed!</p>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="mt-6 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Account Information</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Email Verified: <span className="text-emerald-400 font-medium">Yes</span></span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Account ID: <span className="text-white font-mono text-sm">{user.$id}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
