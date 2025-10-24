# Appwrite Setup Guide - Profile Pictures

## 🪣 Step 1: Create Storage Bucket in Appwrite Console

Follow these steps to create a storage bucket for profile pictures:

### 1. Go to Appwrite Console
- Navigate to: https://cloud.appwrite.io/console
- Select your project: **68efd81f00170987dcdc**

### 2. Create Storage Bucket
1. Click on **Storage** in the left sidebar
2. Click **Create Bucket** button
3. Fill in the details:
   - **Bucket ID**: `profile-pictures` (must match exactly)
   - **Name**: Profile Pictures
   - **Enabled**: ✅ Yes
   - **Maximum File Size**: 5 MB (5000000 bytes)
   - **Allowed File Extensions**: jpg, jpeg, png, gif, webp
   - **Compression**: None (or GZIP if preferred)
   - **Encryption**: ✅ Enabled (recommended)
   - **Antivirus**: ✅ Enabled (recommended)

### 3. Set Bucket Permissions
After creating the bucket, configure permissions:

**File Security**: File level

**Permissions**:
- **Create Files**: 
  - `role:member` (Logged-in users can upload)
  
- **Read Files**: 
  - `role:any` (Anyone can view profile pictures)
  
- **Update Files**: 
  - `role:member` (Users can update their own pictures)
  
- **Delete Files**: 
  - `role:member` (Users can delete their own pictures)

### 4. Advanced Settings (Optional)
- **Image Preview**: Enable for thumbnails
- **Formats**: jpg, jpeg, png, gif, webp
- **Quality**: 90%
- **Width**: Leave empty (original)
- **Height**: Leave empty (original)

---

## 📊 Step 2: Update Database Collection Schema

Add a new attribute to Collection "15" for storing profile picture file ID:

### In Appwrite Console:
1. Go to **Databases** → Select your database (`68efd8c400255230a04a`)
2. Click on Collection **"15"**
3. Go to **Attributes** tab
4. Click **Create Attribute**

### New Attribute Details:
- **Attribute ID**: `profilePictureId`
- **Type**: String
- **Size**: 255 characters
- **Required**: No (optional)
- **Default**: (leave empty)
- **Array**: No

### Updated Collection Schema:
```
Collection: 15
├── name (String, Required)
├── email (String, Required)
├── userId (String, Required)
├── department (String, Required)
├── Phone (Integer, Required)
├── bkashTransactionId (String, Required)
├── createdAt (DateTime, Required)
└── profilePictureId (String, Optional) ← NEW!
```

---

## 🔐 Step 3: Security Best Practices

### Bucket Security Rules:
```
1. File Size Limit: 5 MB max
2. Allowed Extensions: jpg, jpeg, png, gif, webp only
3. File Security: File level (users can only modify their own)
4. Antivirus: Enabled
5. Encryption: Enabled
```

### Permissions Matrix:
| Action | Who Can Perform | Note |
|--------|----------------|------|
| Upload | Logged-in users | `role:member` |
| View | Anyone | `role:any` (public profile pictures) |
| Update | File owner | Automatic with file-level security |
| Delete | File owner | Automatic with file-level security |

---

## 🧪 Step 4: Test the Setup

### Test Bucket Creation:
1. In Appwrite Console → Storage → profile-pictures
2. Manually upload a test image
3. Verify it appears in the bucket

### Test Permissions:
1. Try uploading from your application
2. Verify the file appears in Appwrite Console
3. Test viewing the image URL

### Test URL Format:
```
https://cloud.appwrite.io/v1/storage/buckets/profile-pictures/files/{fileId}/view?project=68efd81f00170987dcdc
```

---

## 📝 Quick Reference

### Bucket Configuration:
- **Bucket ID**: `profile-pictures`
- **Database ID**: `68efd8c400255230a04a`
- **Collection ID**: `15`
- **New Attribute**: `profilePictureId` (String, Optional)

### File Upload Limits:
- **Max Size**: 5 MB
- **Allowed Types**: jpg, jpeg, png, gif, webp
- **Compression**: Optional

### Environment Variables (Already Set):
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68efd81f00170987dcdc
```

---

## ⚠️ Important Notes

1. **Bucket ID Must Match**: The bucket ID `profile-pictures` in Appwrite must exactly match the one in code
2. **Attribute Name**: Use `profilePictureId` in the database (lowercase 'p' after 'profile')
3. **File Security**: Set to "File level" for better security
4. **Public Access**: Profile pictures are publicly viewable (good for displaying avatars)

---

## 🆘 Troubleshooting

### Issue: "Bucket not found"
- **Solution**: Verify bucket ID is exactly `profile-pictures` in Appwrite Console

### Issue: "Permission denied" when uploading
- **Solution**: Check bucket permissions include `role:member` for Create

### Issue: Images not displaying
- **Solution**: Verify Read permission includes `role:any`

### Issue: "File size exceeded"
- **Solution**: Ensure image is under 5 MB or increase bucket limit

---

**Setup Checklist**:
- [ ] Created `profile-pictures` bucket in Appwrite
- [ ] Set bucket permissions (Create: member, Read: any)
- [ ] Added `profilePictureId` attribute to Collection "15"
- [ ] Set file size limit to 5 MB
- [ ] Added allowed extensions: jpg, jpeg, png, gif, webp
- [ ] Enabled antivirus and encryption
- [ ] Tested manual file upload in console

Once completed, the profile picture feature will be fully functional! 🎉
