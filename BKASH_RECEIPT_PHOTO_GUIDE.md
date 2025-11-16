# 📸 bKash Receipt Photo Feature - Setup Guide

## 🎯 What Changed?

The system has been updated to use **bKash transaction photo/screenshot** instead of text Transaction ID. Users now upload a screenshot of their bKash payment confirmation.

---

## ✅ What Was Updated

### 1. **Registration Page**
- ❌ **Removed:** bKash Transaction ID text field
- ✅ **Added:** bKash Receipt photo upload (REQUIRED)
- ✅ Image preview before submission
- ✅ File validation (type and size)

### 2. **Profile Page**
- ❌ **Removed:** Display of Transaction ID text
- ✅ **Added:** Display bKash receipt screenshot
- ✅ Click to view full-size image
- ✅ Hover effect with zoom icon

### 3. **Database Schema**
- ❌ **Old Field:** `bkashTransactionId` (String)
- ✅ **New Field:** `bkashTransactionPhotoId` (String - stores file ID)

---

## 🚀 Required Appwrite Setup

### Step 1: Create bKash Receipts Storage Bucket

1. **Go to Appwrite Console** → **Storage**
2. Click **"Create Bucket"**
3. Configure as follows:

```
Bucket ID: bkash-receipts (MUST match exactly)
Name: bKash Receipts
Enabled: Yes
Maximum File Size: 5 MB (5000000 bytes)
Allowed Extensions: jpg, jpeg, png, gif, webp
Compression: None or GZIP
Encryption: Enabled ✅
Antivirus: Enabled ✅
File Security: File level
```

4. **Set Permissions:**
   - **Create**: `role:member` (logged-in users can upload)
   - **Read**: `role:any` (admins/anyone can view receipts)
   - **Update**: `role:member` (file owners can update)
   - **Delete**: `role:admin` (only admins can delete)

### Step 2: Update Database Collection

You have TWO options:

#### Option A: Add New Attribute (Recommended - Keep Old Data)
1. Go to **Databases** → `68efd8c400255230a04a` → Collection "15"
2. Click **Attributes** → **Create Attribute**
3. Add new field:
   ```
   Attribute ID: bkashTransactionPhotoId
   Type: String
   Size: 255
   Required: No
   Array: No
   ```
4. Keep `bkashTransactionId` for backward compatibility

#### Option B: Replace Old Attribute (Clean Slate)
1. Go to **Databases** → `68efd8c400255230a04a` → Collection "15"
2. **Delete** old attribute: `bkashTransactionId`
3. **Create** new attribute:
   ```
   Attribute ID: bkashTransactionPhotoId
   Type: String
   Size: 255
   Required: No
   Array: No
   ```

⚠️ **Warning:** Option B will delete all existing transaction IDs!

---

## 📋 Updated Collection Schema

```
Collection: 15
├── name (String, Required)
├── email (String, Required)
├── userId (String, Required)
├── department (String, Required)
├── Phone (Integer, Required)
├── profilePictureId (String, Optional)
├── bkashTransactionPhotoId (String, Optional) ← NEW!
├── bkashTransactionId (String, Optional) ← OLD (can keep or remove)
└── createdAt (DateTime, Required)
```

---

## 🔄 User Flow

### During Registration:
1. User fills registration form
2. User uploads bKash payment screenshot **(REQUIRED)**
3. Screenshot is validated (5MB max, image types only)
4. Preview shown before upload
5. On submit:
   - Appwrite Auth user created
   - Profile picture uploaded (if provided)
   - **bKash receipt uploaded to Storage**
   - Receipt file ID stored in database
   - User redirected to login

### On Profile Page:
1. User logs in
2. Profile displays with bKash receipt image
3. User can click image to view full size
4. Hover shows zoom icon

---

## 🛠️ Technical Details

### File Validation (bKash Receipts)
```javascript
- Allowed Types: image/jpeg, image/jpg, image/png, image/gif, image/webp
- Max Size: 5 MB (5,000,000 bytes)
- Required: YES (cannot skip)
- Validation: Client-side before upload
```

### Storage Structure
```
Appwrite Storage
├── profile-pictures/ (Bucket)
│   ├── {profilePictureId1}.jpg
│   └── {profilePictureId2}.png
└── bkash-receipts/ (Bucket) ← NEW!
    ├── {receiptId1}.jpg
    ├── {receiptId2}.png
    └── {receiptId3}.webp
```

### Database Structure
```
User Document:
{
  "name": "John Doe",
  "email": "john@example.com",
  "userId": "12345",
  "department": "CSE",
  "Phone": 1234567890,
  "profilePictureId": "abc123", // Optional
  "bkashTransactionPhotoId": "xyz789", // Receipt file ID
  "createdAt": "2025-10-18T..."
}
```

### Image URL Format
```
https://fra.cloud.appwrite.io/v1/storage/buckets/bkash-receipts/files/{fileId}/view?project={projectId}
```

---

## 📝 Code Changes Summary

### 1. `lib/appwrite.ts`
```typescript
+ export const BKASH_RECEIPTS_BUCKET_ID = 'bkash-receipts';
+ export const getBkashReceiptUrl = (fileId: string) => { ... }
```

### 2. `app/register/page.tsx`
```typescript
- bkashTransactionId text field
+ bkashReceipt file upload (required)
+ bkashReceiptPreview state
+ handleBkashReceiptChange()
+ Upload receipt to storage
+ Save receiptId to database as bkashTransactionPhotoId
```

### 3. `app/profile/page.tsx`
```typescript
- Display bkashTransactionId text
+ Display bkashTransactionPhotoId as image
+ Click to view full size
+ Hover zoom effect
```

---

## 🎨 UI Features

### Registration Page
- **bKash Receipt Upload Section:**
  - 📸 Large preview area (132x132px)
  - Upload button with icon
  - File requirements displayed
  - Yellow warning: "Upload your bKash payment screenshot"
  - Remove button on preview
  - Required field indicator (*)

### Profile Page
- **bKash Receipt Display:**
  - Full-width image container
  - Click to open in new tab
  - Hover effect with zoom icon
  - Smooth scale transition
  - Fallback message if no receipt

---

## 🔒 Security & Privacy

### Access Control
- **Upload**: Only logged-in users
- **View**: Anyone (for admin verification)
- **Delete**: Only admins (for security)

### Why Public Read?
Admins need to verify payment receipts. However, only users with the file ID (from database) can access specific receipts.

### File Security
- File-level security enabled
- Antivirus scanning enabled
- Encryption at rest
- Only those with database access can find file IDs

---

## ✅ Setup Checklist

- [ ] **Step 1:** Create `bkash-receipts` bucket in Appwrite Storage
- [ ] **Step 2:** Set bucket permissions (Create: member, Read: any)
- [ ] **Step 3:** Add `bkashTransactionPhotoId` attribute to Collection "15"
- [ ] **Step 4:** Configure bucket settings (5MB max, image types only)
- [ ] **Step 5:** Test registration with receipt upload
- [ ] **Step 6:** Test profile display of receipt
- [ ] **Step 7:** Verify full-size image opens correctly

---

## 🧪 Testing

### Test Registration:
1. Go to `/register`
2. Fill out all fields
3. **Don't upload receipt** → Should show error ❌
4. **Upload receipt** → Should succeed ✅
5. Check Appwrite Storage → Receipt should appear
6. Check Database → `bkashTransactionPhotoId` should be set

### Test Profile Display:
1. Login with registered user
2. Go to `/profile`
3. Scroll to bKash section
4. **Receipt should display** ✅
5. **Hover** → Zoom icon appears
6. **Click** → Opens full-size in new tab

### Test Edge Cases:
- [ ] Upload non-image file (should fail)
- [ ] Upload file > 5MB (should fail)
- [ ] Upload valid receipt (should succeed)
- [ ] View profile without receipt (shows "No receipt uploaded")

---

## 🐛 Common Issues

### Issue: "Bucket not found"
**Solution:**
1. Verify bucket ID is exactly `bkash-receipts`
2. Check bucket is enabled
3. Restart dev server after creating bucket

### Issue: "Please fill in all required fields..."
**Solution:**
- Make sure to upload bKash receipt screenshot
- Receipt upload is now **REQUIRED**

### Issue: Receipt not displaying on profile
**Solution:**
1. Check `bkashTransactionPhotoId` exists in database
2. Verify Read permission includes `role:any`
3. Check browser console for image loading errors
4. Verify file ID is correct

### Issue: "Permission denied" when uploading
**Solution:**
1. Check bucket permissions include `role:member` for Create
2. Verify user is logged in
3. Check File Security is set to "File level"

---

## 📊 Migration Guide (For Existing Data)

If you have existing users with `bkashTransactionId` text:

### Option 1: Manual Migration
1. Contact users to re-register with screenshots
2. Delete old registrations after verification

### Option 2: Keep Both Fields
1. Keep `bkashTransactionId` in database
2. Add `bkashTransactionPhotoId`
3. Update profile page to show both if available

### Option 3: Admin Tool (Future Enhancement)
Create an admin tool to:
- View old Transaction IDs
- Allow admins to upload screenshots manually
- Link screenshots to existing users

---

## 🚀 Benefits of This Change

✅ **Better Verification:** Visual proof of payment
✅ **Fraud Prevention:** Harder to fake than text IDs
✅ **Dispute Resolution:** Clear evidence if issues arise
✅ **User-Friendly:** Screenshots are easy to take
✅ **Automated Processing:** Potential OCR in future

---

## 🎯 Next Steps

1. **Complete Appwrite setup** (bucket + attribute)
2. **Restart dev server** (important!)
3. **Test registration** with screenshot upload
4. **Test profile display** of receipt
5. **Verify admin can view** receipts for verification
6. 🎉 **Feature is ready!**

---

## 📞 Support

**Documentation Files:**
- `APPWRITE_CHECKLIST.md` - Complete setup verification
- `PROFILE_PICTURE_FEATURE.md` - Profile picture feature docs
- `APPWRITE_SETUP_GUIDE.md` - General Appwrite setup

**Need Help?**
- Appwrite Storage Docs: https://appwrite.io/docs/products/storage
- Appwrite Console: https://cloud.appwrite.io/console

---

**Last Updated:** October 18, 2025  
**Version:** 2.0.0 (bKash Receipt Photo Feature)
