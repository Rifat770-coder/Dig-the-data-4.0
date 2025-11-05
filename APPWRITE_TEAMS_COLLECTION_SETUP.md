# Appwrite Teams Collection Setup Guide

## Quick Setup Instructions

### 1. Access Appwrite Console
- Go to: https://cloud.appwrite.io
- Login to your account
- Select Project ID: `68efd81f00170987dcdc`
- Go to Database ID: `68efd8c400255230a04a`

---

## 2. Create Teams Collection

Click "**Add Collection**" and configure:

**Collection Name**: `teams`  
**Collection ID**: `teams` (custom) or auto-generate

---

## 3. Add Attributes (in order)

### Attribute 1: name
```
Type: String
Size: 50
Required: Yes
Array: No
Default: (none)
```

### Attribute 2: description
```
Type: String
Size: 500
Required: No
Array: No
Default: (none)
```

### Attribute 3: teamCode
```
Type: String
Size: 20
Required: Yes
Array: No
Default: (none)
```

### Attribute 4: leaderId
```
Type: String
Size: 100
Required: Yes
Array: No
Default: (none)
```

### Attribute 5: memberIds
```
Type: String
Size: 100
Required: Yes
Array: Yes
Array Size (min): 4
Array Size (max): 4
Default: (none)
```

### Attribute 6: createdBy
```
Type: String
Size: 100
Required: Yes
Array: No
Default: (none)
```

### Attribute 7: isActive
```
Type: Boolean
Required: Yes
Array: No
Default: true
```

### Attribute 8: maxMembers
```
Type: Integer
Min: 4
Max: 4
Required: Yes
Array: No
Default: 4
```

---

## 4. Create Indexes

### Index 1: teamCode_unique
```
Type: Unique
Attributes: teamCode
```

### Index 2: leaderId_index
```
Type: Key
Attributes: leaderId
```

### Index 3: createdAt_index
```
Type: Key
Attributes: $createdAt (select from dropdown)
```

---

## 5. Set Permissions

Go to **Settings > Permissions** tab:

### For Development/Testing:
```
Create: Any
Read: Any
Update: Any
Delete: Any
```

**OR using roles:**
```
Create: role:all
Read: role:all
Update: role:all
Delete: role:all
```

### For Production:
Consider restricting to authenticated users:
```
Create: role:member
Read: role:member
Update: role:admin
Delete: role:admin
```

---

## 6. Verify Setup

After creating the collection, verify:

✅ **8 attributes** created  
✅ **3 indexes** created  
✅ **Permissions** set appropriately  
✅ Collection ID matches your config: `teams`

---

## 7. Test the Collection

### Test 1: Create a Team Document

In Appwrite Console, click "**Add Document**":

```json
{
  "name": "Test Team",
  "description": "Test team for verification",
  "teamCode": "TEST01",
  "leaderId": "user_id_here",
  "memberIds": ["user1_id", "user2_id", "user3_id", "user4_id"],
  "createdBy": "admin",
  "isActive": true,
  "maxMembers": 4
}
```

### Test 2: Query by Team Code

In the console, test this query:
```
Query: teamCode = "TEST01"
```

Should return your test document.

### Test 3: Delete Test Document

Delete the test document after verification.

---

## 8. Integration with Your App

Once the collection is set up, your Next.js app will automatically use it because:

1. ✅ Collection ID `teams` is already defined in `lib/appwrite.ts`
2. ✅ All CRUD operations are in `lib/team-api.ts`
3. ✅ Admin panel at `/admin` is ready to use
4. ✅ Team dashboard at `/team-dashboard` will display teams

---

## Common Issues & Solutions

### Issue: "Attribute not found"
**Cause**: Missing attribute in collection  
**Fix**: Add the missing attribute following Step 3

### Issue: "Invalid document structure"
**Cause**: Required field missing or wrong type  
**Fix**: Ensure all required fields are present and correct type

### Issue: "Unique constraint violation"
**Cause**: Duplicate teamCode  
**Fix**: Each team needs a unique code

### Issue: "Array size mismatch"
**Cause**: memberIds array doesn't have exactly 4 items  
**Fix**: Ensure exactly 4 user IDs in the array

---

## Database Structure Diagram

```
Database: 68efd8c400255230a04a
│
├── Collection: users (ID: '15')
│   ├── name (String)
│   ├── email (String)
│   ├── userId (String)
│   ├── department (String)
│   ├── Phone (Number)
│   ├── profilePictureId (String, optional)
│   └── ...other fields
│
└── Collection: teams (ID: 'teams')
    ├── name (String, required)
    ├── description (String, optional)
    ├── teamCode (String, required, unique)
    ├── leaderId (String, required)
    ├── memberIds (String[], required, exactly 4)
    ├── createdBy (String, required)
    ├── isActive (Boolean, required)
    └── maxMembers (Integer, required, default: 4)
```

---

## Expected Behavior After Setup

### Admin Panel (`/admin`):
1. Login with password: `nccrifat`
2. Switch to "Teams" tab
3. Click "Create New Team"
4. See list of available users (not in any team)
5. Select exactly 4 users
6. Enter team name and code
7. Submit → Team created in Appwrite

### Team Dashboard (`/team-dashboard`):
1. Team members login with team code
2. See team information
3. See all 4 member cards
4. Each card shows profile picture, name, department, email

---

## Validation Rules Enforced

✅ Team name: 3-50 characters  
✅ Team code: 4-20 characters, unique, auto-uppercase  
✅ Exactly 4 members required  
✅ No user in multiple teams  
✅ No leader in multiple teams  
✅ First member is automatically leader  

---

## Next Steps

1. ✅ Complete this Appwrite setup
2. ✅ Verify collection structure
3. ✅ Set permissions
4. ✅ Test with one team creation
5. ✅ Use admin panel to manage teams
6. ✅ Test team dashboard login

---

**Important Notes:**

- Appwrite provides `$createdAt` and `$updatedAt` automatically - don't create these as custom attributes
- The `$id` field is also auto-generated by Appwrite
- Team codes are stored in UPPERCASE for consistency
- All queries use the built-in Appwrite fields where possible

---

**Setup Time Estimate:** 10-15 minutes

**Difficulty:** Easy - just follow the steps in order

**Prerequisites:** Active Appwrite account and project

---

Last Updated: November 2, 2025
