import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { account, databases, storage, DATABASE_ID, USERS_COLLECTION_ID, PROFILE_PICTURES_BUCKET_ID, getProfilePictureUrl } from '@/lib/appwrite';
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

export default function IndividualProfile() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploadingNewPicture, setUploadingNewPicture] = useState(false);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

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
        
        if (data.profilePictureId) {
          const pictureUrl = getProfilePictureUrl(data.profilePictureId);
          setProfilePictureUrl(pictureUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleProfilePictureUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData || !documentId) return;

    try {
      setUploadingNewPicture(true);

      if (userData.profilePictureId) {
        await storage.deleteFile(PROFILE_PICTURES_BUCKET_ID, userData.profilePictureId);
      }

      const fileUpload = await storage.createFile(
        PROFILE_PICTURES_BUCKET_ID,
        ID.unique(),
        file
      );

      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        { profilePictureId: fileUpload.$id }
      );

      const newPictureUrl = getProfilePictureUrl(fileUpload.$id);
      setProfilePictureUrl(newPictureUrl);
      setUserData({ ...userData, profilePictureId: fileUpload.$id });

    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setUploadingNewPicture(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <p className="text-red-400">Profile Not Found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6">Individual Profile</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative w-24 h-24">
                        {profilePictureUrl ? (
                            <Image src={profilePictureUrl} alt="Profile" layout="fill" className="rounded-full object-cover" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                            </div>
                        )}
                        <label htmlFor="updateProfilePicture" className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full cursor-pointer">
                            {uploadingNewPicture ? '...' : 'Edit'}
                        </label>
                        <input
                            type="file"
                            id="updateProfilePicture"
                            accept="image/*"
                            onChange={handleProfilePictureUpdate}
                            className="hidden"
                            disabled={uploadingNewPicture}
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{userData.name}</h2>
                        <p className="text-gray-400">{userData.email}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p><strong>User ID:</strong> {userData.userId}</p>
                    <p><strong>Department:</strong> {userData.department}</p>
                    <p><strong>Phone:</strong> {userData.Phone}</p>
                    <p><strong>Registered:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-6 flex space-x-4">
                    <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg">Logout</button>
                    <Link href="/" className="bg-cyan-600 px-4 py-2 rounded-lg">Home</Link>
                </div>
            </div>
        </div>
    </div>
  );
}
