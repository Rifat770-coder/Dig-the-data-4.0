# 🔒 Appwrite Permissions Configuration Guide

## Issue: "Not Authorized" Errors

If you're seeing errors like:
- ❌ "Failed to fetch available users: The current user is not authorized"
- ❌ "Failed to fetch teams: The current user is not authorized"
- ❌ "Failed to delete team: The current user is not authorized"

This means your Appwrite collections don't have the proper permissions configured.

---

## 🎯 Quick Fix (5 minutes)

### Step 1: Access Appwrite Console
1. Go to: https://cloud.appwrite.io
2. Login to your account
3. Select Project ID: `68efd81f00170987dcdc`
4. Navigate to **Databases** → Database ID: `68efd8c400255230a04a`

---

### Step 2: Configure Users Collection Permissions

1. Click on **"users"** collection (or collection ID: `15`)
2. Go to **Settings** tab
3. Click **Permissions** section
4. Click **Add Role**

**Add these permissions:**

#### For Development/Testing (Easiest):
```
Create: Any
Read: Any  
Update: Any
Delete: Any
```

#### Using Role Labels:
```
Create: role:all
Read: role:all
Update: role:all
Delete: role:all
```

5. Click **Update** to save

---

### Step 3: Configure Teams Collection Permissions

1. Click on **"teams"** collection
2. Go to **Settings** tab
3. Click **Permissions** section
4. Click **Add Role**

**Add these permissions:**

#### For Development/Testing (Easiest):
```
Create: Any
Read: Any
Update: Any
Delete: Any
```

#### Using Role Labels:
```
Create: role:all
Read: role:all
Update: role:all
Delete: role:all
```

5. Click **Update** to save

---

## 📋 Visual Guide

### How to Add Permissions:

```
1. In Collection Settings → Permissions
2. Click "+ Add Role" button
3. Select permission type from dropdown:
   - Any (allows anyone, including guests)
   - role:all (authenticated users)
   - role:guests (unauthenticated users)
   - role:member (authenticated members)
4. Check the boxes for operations:
   ☑️ Create
   ☑️ Read
   ☑️ Update
   ☑️ Delete
5. Click "Update" or "Add"
```

---

## 🔐 Permission Levels Explained

### **Any** (Recommended for Development)
- ✅ Fastest to set up
- ✅ Works without authentication
- ⚠️ Less secure (use only for development/testing)

### **role:all**
- ✅ Works for all users
- ✅ No authentication required
- ✅ Good for public read operations

### **role:guests**
- ✅ For unauthenticated users
- ✅ Good for public data
- ⚠️ Not for sensitive operations

### **role:member**
- ✅ Requires authentication
- ✅ More secure
- ⚠️ Requires proper auth setup

---

## ✅ Verification Steps

After setting permissions, test these operations:

### Test 1: View Admin Panel
```bash
1. Navigate to http://localhost:3000/admin
2. Login with password: nccrifat
3. Switch to "Teams" tab
```

**Expected Result:** ✅ You should see teams list without errors

### Test 2: Create Team
```bash
1. Click "Create New Team"
2. Fill in team details
3. Select 4 users
4. Submit
```

**Expected Result:** ✅ Team created successfully

### Test 3: View Available Users
```bash
1. In admin panel
2. Click "Create New Team"
3. Scroll to member selection
```

**Expected Result:** ✅ List of available users appears

### Test 4: Delete Team
```bash
1. Click delete button on a team
2. Confirm deletion
```

**Expected Result:** ✅ Team deleted successfully

---

## 🚨 Common Issues & Solutions

### Issue 1: "Still getting permission errors after setting permissions"
**Solution:**
- Clear browser cache
- Reload the page (Ctrl+F5 or Cmd+Shift+R)
- Check that you saved the permissions
- Verify you're in the correct database and collection

### Issue 2: "Can't find the Permissions section"
**Solution:**
- Make sure you're in **Settings** tab of the collection
- Scroll down to find **Permissions** section
- If using Appwrite Console, ensure you have admin access

### Issue 3: "Permissions saved but still not working"
**Solution:**
1. Check that permissions apply to the correct operations
2. Verify collection ID matches your code
3. Try using "Any" permission for all operations
4. Check Appwrite console logs for detailed errors

### Issue 4: "Which permission should I use?"
**Solution:**
- **For Development/Testing:** Use "Any" for all operations
- **For Production:** Use "role:member" for write operations, "role:all" for read
- **For Public Data:** Use "role:all" for read, restrict write operations

---

## 🎯 Recommended Permission Setup

### For Development (Current Phase):

**Users Collection:**
```
Create: Any
Read: Any
Update: Any
Delete: Any
```

**Teams Collection:**
```
Create: Any
Read: Any
Update: Any
Delete: Any
```

### For Production (Later):

**Users Collection:**
```
Create: role:all (allow registration)
Read: role:all (allow viewing)
Update: role:member (only update own profile)
Delete: role:admin (only admin can delete)
```

**Teams Collection:**
```
Create: role:admin (only admin creates teams)
Read: role:all (everyone can view)
Update: role:admin (only admin updates)
Delete: role:admin (only admin deletes)
```

---

## 📸 Screenshot Reference

Your Appwrite permissions panel should look like this:

```
┌─────────────────────────────────────────┐
│ Permissions                              │
├─────────────────────────────────────────┤
│ + Add Role                               │
│                                          │
│ ✓ Any                                    │
│   ☑ Create  ☑ Read  ☑ Update  ☑ Delete │
│                                          │
│ Or:                                      │
│                                          │
│ ✓ role:all                               │
│   ☑ Create  ☑ Read  ☑ Update  ☑ Delete │
└─────────────────────────────────────────┘
```

---

## 🔄 Alternative: Using Appwrite CLI

If you prefer command line:

```bash
# Install Appwrite CLI
npm install -g appwrite

# Login
appwrite login

# Set permissions for teams collection
appwrite databases updateCollection \
  --databaseId "68efd8c400255230a04a" \
  --collectionId "teams" \
  --permissions "read(\"any\")" "create(\"any\")" "update(\"any\")" "delete(\"any\")"

# Set permissions for users collection
appwrite databases updateCollection \
  --databaseId "68efd8c400255230a04a" \
  --collectionId "15" \
  --permissions "read(\"any\")" "create(\"any\")" "update(\"any\")" "delete(\"any\")"
```

---

## ✅ After Configuration

Once permissions are set correctly:

✅ Admin panel loads without errors  
✅ Teams list displays properly  
✅ Available users show up  
✅ Can create teams  
✅ Can update teams  
✅ Can delete teams  
✅ No more "not authorized" errors  

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check Appwrite Status:** https://status.appwrite.io
2. **Review Appwrite Logs:** In console → Logs section
3. **Verify Collection IDs:** Ensure they match your .env.local
4. **Check Database ID:** Confirm it's `68efd8c400255230a04a`
5. **Test with Appwrite REST API:** Use Postman to test permissions

---

## 🎓 Learn More

- [Appwrite Permissions Docs](https://appwrite.io/docs/permissions)
- [Appwrite Database Docs](https://appwrite.io/docs/databases)
- [Appwrite Console Guide](https://appwrite.io/docs/console)

---

**Time Required:** 5-10 minutes  
**Difficulty:** Easy  
**Priority:** High (Required for app to work)

---

Last Updated: November 2, 2025
