# ✅ Appwrite Setup Verification Checklist

Use this checklist to verify your Appwrite setup is complete.

---

## 🎯 Quick Status Check

Run through this checklist to see what's done and what's missing:

### 1. Database Attribute Setup

**Location:** Appwrite Console → Databases → `68efd8c400255230a04a` → Collection "15" → Attributes

**Check if you see:**
- [ ] Attribute named `profilePictureId`
- [ ] Type: String
- [ ] Size: 255
- [ ] Required: No

**Status:**
- ✅ **DONE**: You see the attribute listed
- ❌ **MISSING**: Attribute doesn't exist → **[CREATE IT NOW](#how-to-create-database-attribute)**

---

### 2. Storage Bucket Setup

**Location:** Appwrite Console → Storage → Buckets

**Check if you see:**
- [ ] Bucket with ID: `profile-pictures`
- [ ] Status: Enabled
- [ ] Max File Size: 5 MB

**Status:**
- ✅ **DONE**: Bucket exists
- ❌ **MISSING**: Bucket doesn't exist → **[CREATE IT NOW](#how-to-create-storage-bucket)**

---

### 3. Bucket Permissions

**Location:** Appwrite Console → Storage → profile-pictures → Settings → Permissions

**Check permissions:**
- [ ] Create: `role:member`
- [ ] Read: `role:any`
- [ ] Update: `role:member`
- [ ] Delete: `role:member`

**Status:**
- ✅ **DONE**: All permissions set correctly
- ⚠️ **NEEDS FIX**: Permissions missing or wrong → **[FIX PERMISSIONS](#how-to-set-bucket-permissions)**

---

## 📋 Setup Instructions

### How to Create Database Attribute

1. **Navigate:**
   ```
   Appwrite Console → Databases → 68efd8c400255230a04a → Collection "15" → Attributes Tab
   ```

2. **Click:** "Create Attribute" button

3. **Fill in:**
   - **Attribute Key:** `profilePictureId`
   - **Type:** Select "String"
   - **Size:** `255`
   - **Required:** ☐ Uncheck (should be NO)
   - **Array:** ☐ Uncheck (should be NO)
   - **Default Value:** Leave empty

4. **Click:** "Create" button

5. **Wait:** 10-30 seconds for creation

6. **Verify:** Attribute appears in the list

---

### How to Create Storage Bucket

1. **Navigate:**
   ```
   Appwrite Console → Storage (left sidebar)
   ```

2. **Click:** "Create Bucket" button

3. **Fill in Basic Info:**
   - **Bucket ID:** `profile-pictures` (must be exact)
   - **Name:** `Profile Pictures` (can be anything)

4. **Configure Settings:**
   - **Enabled:** ✅ Check
   - **Maximum File Size:** `5000000` (5 MB in bytes)
   - **Allowed File Extensions:** `jpg, jpeg, png, gif, webp`
   - **File Security:** Select "File level"

5. **Optional Security:**
   - **Compression:** None or GZIP
   - **Encryption:** ✅ Check (recommended)
   - **Antivirus:** ✅ Check (recommended)

6. **Click:** "Create" button

---

### How to Set Bucket Permissions

1. **Navigate:**
   ```
   Appwrite Console → Storage → profile-pictures bucket → Settings → Permissions
   ```

2. **Add Create Permission:**
   - Click "Add Role"
   - Select "Authenticated users" or enter `role:member`
   - Check: ✅ Create
   - Click "Add"

3. **Add Read Permission:**
   - Click "Add Role"
   - Select "Any" or enter `role:any`
   - Check: ✅ Read
   - Click "Add"

4. **Add Update Permission:**
   - Click "Add Role"
   - Select "Authenticated users" or enter `role:member`
   - Check: ✅ Update
   - Click "Add"

5. **Add Delete Permission:**
   - Click "Add Role"
   - Select "Authenticated users" or enter `role:member`
   - Check: ✅ Delete
   - Click "Add"

---

## 🧪 Testing After Setup

### Test 1: Registration (No Picture)
```bash
Status: Should work after adding database attribute

Steps:
1. Go to http://localhost:3000/register
2. Fill in all required fields
3. Skip profile picture upload
4. Submit form

Expected: ✅ Registration succeeds
```

### Test 2: Registration (With Picture)
```bash
Status: Requires both database attribute AND storage bucket

Steps:
1. Complete setup (attribute + bucket)
2. Go to http://localhost:3000/register
3. Fill in all required fields
4. Upload a profile picture (jpg/png)
5. Submit form

Expected: ✅ Registration succeeds + picture stored
```

### Test 3: Profile Picture Display
```bash
Status: Requires both setups + successful registration with picture

Steps:
1. Login with registered user
2. Go to /profile
3. Check if profile picture displays

Expected: ✅ Picture displays correctly
```

### Test 4: Profile Picture Update
```bash
Status: Requires all setups + logged in user

Steps:
1. Login and go to /profile
2. Hover over avatar
3. Click camera icon
4. Select new image
5. Wait for upload

Expected: ✅ Picture updates, old one deleted
```

---

## 🎯 Current Setup Status

Mark what you've completed:

### Database ✅
- [ ] Database exists: `68efd8c400255230a04a`
- [ ] Collection exists: "15"
- [ ] Attribute `profilePictureId` created
- [ ] Attribute is optional (Required: No)

### Storage ✅
- [ ] Bucket created: `profile-pictures`
- [ ] Bucket is enabled
- [ ] Max file size: 5 MB
- [ ] Allowed extensions configured

### Permissions ✅
- [ ] Create permission: `role:member`
- [ ] Read permission: `role:any`
- [ ] Update permission: `role:member`
- [ ] Delete permission: `role:member`

### Testing ✅
- [ ] Tested registration without picture
- [ ] Tested registration with picture
- [ ] Tested picture display on profile
- [ ] Tested picture update

---

## ⚡ Common Issues

### ❌ Error: "Unknown attribute: profilePictureId"
**Solution:** Database attribute not created → Create it now

### ❌ Error: "Bucket not found"
**Solution:** Storage bucket not created → Create bucket with ID `profile-pictures`

### ❌ Error: "Permission denied" when uploading
**Solution:** Bucket permissions missing → Add `role:member` for Create

### ❌ Pictures not displaying
**Solution:** Read permission missing → Add `role:any` for Read

### ❌ Can't update picture
**Solution:** Update permission missing → Add `role:member` for Update

---

## 📊 Setup Progress Tracker

Track your progress:

```
Step 1: Database Attribute     [   ] → [ ✓ ]
Step 2: Storage Bucket         [   ] → [ ✓ ]
Step 3: Bucket Permissions     [   ] → [ ✓ ]
Step 4: Test Registration      [   ] → [ ✓ ]
Step 5: Test Profile Display   [   ] → [ ✓ ]
Step 6: Test Profile Update    [   ] → [ ✓ ]

Status: ____% Complete
```

---

## 🎉 All Done?

When all checkboxes are ✅:
- Registration works with and without pictures
- Profile pictures display correctly
- Users can update their pictures
- No more errors in console

**Congratulations! Your profile picture feature is fully functional!** 🎊

---

## 📚 Additional Resources

- **Detailed Setup:** `APPWRITE_SETUP_GUIDE.md`
- **Error Fix:** `FIX_PROFILE_PICTURE_ERROR.md`
- **Feature Docs:** `PROFILE_PICTURE_FEATURE.md`
- **Appwrite Docs:** https://appwrite.io/docs

---

**Estimated Total Setup Time:** 5 minutes ⏱️
