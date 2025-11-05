// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ID } from 'appwrite';
import { account, databases, storage, DATABASE_ID, USERS_COLLECTION_ID, PROFILE_PICTURES_BUCKET_ID, BKASH_RECEIPTS_BUCKET_ID } from '@/lib/appwrite';
import { useAuthMode, useIsRegistrationEnabled } from '@/lib/auth-context';

interface FormData {
  name: string;
  email: string;
  id: string;
  department: string;
  Phone: string;
  password: string;
  confirmPassword: string;
  createdAt: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Authentication mode hooks
  const { authMode } = useAuthMode();
  const isRegistrationEnabled = useIsRegistrationEnabled();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    id: '',
    department: '',
    Phone: '',
    password: '',
    confirmPassword: '',
    createdAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // bKash receipt states
  const [bkashReceipt, setBkashReceipt] = useState<File | null>(null);
  const [bkashReceiptPreview, setBkashReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type - using only standard MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image file (jpeg, png, gif, webp)' });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setProfilePicture(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleBkashReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type - using only standard MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image file (jpeg, png, gif, webp)' });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setBkashReceipt(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBkashReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const removeBkashReceipt = () => {
    setBkashReceipt(null);
    setBkashReceiptPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const userId = formData.id.trim();
    const phoneStr = formData.Phone.trim();

    // Validate phone
    if (!/^\d{11}$/.test(phoneStr)) {
      setMessage({ type: 'error', text: 'Phone number must be exactly 11 digits' });
      setLoading(false);
      return;
    }
    const phone = parseInt(phoneStr, 10);

    try {
      // Validate all required fields
      if (!name || !email || !userId || !formData.department || !phoneStr || 
          !formData.password || !formData.confirmPassword || !bkashReceipt) {
        setMessage({ type: 'error', text: 'Please fill in all required fields and upload bKash receipt.' });
        setLoading(false);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setLoading(false);
        return;
      }

      // Validate password strength
      if (formData.password.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
        setLoading(false);
        return;
      }

      // Step 1: Create Appwrite Auth user
      const authUser = await account.create(
        ID.unique(),
        email,
        formData.password,
        name
      );

      // Step 2: Upload profile picture if provided
      let profilePictureId = null;
      if (profilePicture) {
        try {
          setUploadingImage(true);
          const fileUpload = await storage.createFile(
            PROFILE_PICTURES_BUCKET_ID,
            ID.unique(),
            profilePicture
          );
          profilePictureId = fileUpload.$id;
          console.log('Profile picture uploaded:', fileUpload);
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          // Continue with registration even if image upload fails
          setMessage({ type: 'error', text: 'Image upload failed, but continuing registration...' });
        } finally {
          setUploadingImage(false);
        }
      }

      // Step 3: Upload bKash receipt (REQUIRED)
      let bkashReceiptId = null;
      try {
        setUploadingImage(true);
        const receiptUpload = await storage.createFile(
          BKASH_RECEIPTS_BUCKET_ID,
          ID.unique(),
          bkashReceipt
        );
        bkashReceiptId = receiptUpload.$id;
        console.log('bKash receipt uploaded:', receiptUpload);
      } catch (uploadError) {
        console.error('Error uploading bKash receipt:', uploadError);
        setMessage({ type: 'error', text: 'Failed to upload bKash receipt. Please try again.' });
        setLoading(false);
        return;
      } finally {
        setUploadingImage(false);
      }

      // Step 4: Generate a more robust unique ID for database document
            const uniqueDocumentId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            
            // Step 5: Save user data to database
            interface UserDocument {
              name: string;
              email: string;
              userId: string;
              department: string;
              Phone: number;
              bkashTransactionPhotoId: string | null;
              createdAt: string;
              profilePictureId?: string;
            }
      
            const documentData: UserDocument = {
              name: name,
              email: email,
              userId: userId,
              department: formData.department,
              Phone: phone,
              bkashTransactionPhotoId: bkashReceiptId ?? null, // Store photo ID instead of text
              createdAt: new Date().toISOString(),
            };
      
            // Only add profilePictureId if it exists (attribute must be created in Appwrite first)
            if (profilePictureId) {
              documentData.profilePictureId = profilePictureId;
            }
      
            const response = await databases.createDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              uniqueDocumentId,
              documentData
            );

      console.log('Registration successful:', { authUser, dbRecord: response });
      setMessage({ type: 'success', text: 'Registration successful! 🎉 Redirecting to login...' });
      
      // Clear form
      setFormData({
        name: '', 
        email: '', 
        id: '', 
        department: '', 
        Phone: '', 
        password: '',
        confirmPassword: '',
        createdAt: '',
      });
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setBkashReceipt(null);
      setBkashReceiptPreview(null);

      // Redirect to login page after 2 seconds with success message
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);

    } catch (error: unknown) {
      // Log full server response to debug
      console.error('Appwrite error:', error);

      // Check for collection not found error
      if (error && typeof error === 'object') {
        const e = error as Record<string, unknown>;
        
        // Check if it's a 404 error or contains "Collection" in the message
        const isCollectionError = (
          (e.code === 404 || e.status === 404) ||
          (e.message && typeof e.message === 'string' && e.message.includes('Collection'))
        );
        
        if (isCollectionError) {
          console.warn('Users collection not found - this is expected during initial setup');
          setMessage({ 
            type: 'error', 
            text: 'Registration is temporarily unavailable. The system is still being set up. Please try again later or contact support.' 
          });
          return;
        }
      }

      // Safely extract a message from an unknown error shape
      function getErrorMessage(err: unknown): string {
        if (err && typeof err === 'object') {
          const e = err as Record<string, unknown>;
          if (e.response && typeof e.response === 'object') {
            const resp = e.response as Record<string, unknown>;
            if (typeof resp.message === 'string') return resp.message;
          }
          if (typeof e.message === 'string') return e.message;
        }
        return 'Registration failed. Please try again.';
      }

      const serverMessage = getErrorMessage(error);
      setMessage({ type: 'error', text: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-2 sm:p-4 md:p-6" 
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
      suppressHydrationWarning
    >
      {/* Background Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="relative z-10 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
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

        {/* Conditional rendering based on registration mode */}
        {isRegistrationEnabled ? (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Registration</h1>
              <p className="text-sm sm:text-base text-gray-300">Fill in your details to register</p>
            </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" suppressHydrationWarning={true}>
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {/* Preview or Upload Area */}
              <div className="relative">
                {profilePicturePreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-500">
                    <Image
                      src={profilePicturePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Choose Photo</span>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Max 5MB • JPG, PNG, GIF, WEBP
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 text-sm sm:text-base"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 text-sm sm:text-base"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="id" className="block text-sm font-medium text-cyan-300 mb-2">
              ID Number
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 text-sm sm:text-base"
              placeholder="Enter your ID"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-cyan-300 mb-2">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm sm:text-base"
            >
              <option value="" className="bg-gray-700">Select Department</option>
              <option value="Computer Science & Engineering (CSE)" className="bg-gray-700">Computer Science & Engineering (CSE)</option>
              <option value="Textile Engineering (TE)" className="bg-gray-700">Textile Engineering (TE)</option>
              <option value="Industrial & Production Engineering (IPE)" className="bg-gray-700">Industrial & Production Engineering (IPE)</option>
              <option value="Fashion Design & Apparel Engineering (FDAE)" className="bg-gray-700">Fashion Design & Apparel Engineering (FDAE)</option>
              <option value="Electrical & Electronic Engineering (EEE)" className="bg-gray-700">Electrical & Electronic Engineering (EEE)</option>
            </select>
          </div>


          <div>
            <label htmlFor="Phone" className="block text-sm font-medium text-cyan-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="Phone"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 text-sm sm:text-base"
              placeholder="01XXXXXXXXX"
            />
          </div>

          {/* bKash Transaction Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              bKash Transaction Screenshot <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-4">
              {/* Preview or Upload Area */}
              <div className="relative">
                {bkashReceiptPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-500">
                    <Image
                      src={bkashReceiptPreview}
                      alt="bKash receipt preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeBkashReceipt}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs text-gray-400">Receipt</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  htmlFor="bkashReceipt"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-300 border border-pink-500/30 rounded-lg hover:bg-pink-600/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Upload Screenshot</span>
                </label>
                <div className="mb-3">
                  <span className="text-sm font-medium text-cyan-300 block mb-2">bKash Numbers</span>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>1. 01744368707</li>
                    <li>2. 01630904798</li>
                    <li>3. 01882038517</li>
                    <li>4. 01798506446</li>
                    <li>5. 01570292546</li>
                  </ul>
                </div>
                
                <input
                  type="file"
                  id="bkashReceipt"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleBkashReceiptChange}
                  required
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Required • Max 5MB • JPG, PNG, GIF, WEBP
                </p>
                <p className="text-xs text-yellow-400 mt-1">
                  📸 Upload your bKash payment screenshot
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 pr-12 text-sm sm:text-base"
                placeholder="Create a password (min 8 characters)"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder-gray-400 pr-12 text-sm sm:text-base"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
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

          {message && (
            <div
              className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-900/30 text-red-300 border-red-500/30'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30 text-sm sm:text-base"
          >
            {loading ? 'Registering...' : uploadingImage ? 'Uploading Image...' : 'Register'}
          </button>
        </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-bold text-red-400 mb-2">Registration Closed</h2>
              <p className="text-gray-300 mb-4">Registration is currently not available.</p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              <span>Go to Login</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}