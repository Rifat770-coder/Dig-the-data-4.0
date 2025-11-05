# Quick Setup: Teams Collection in Appwrite

## ⚡ Fast Track Setup (5 minutes)

### Step 1: Create Collection (2 min)
1. Go to https://cloud.appwrite.io/console
2. Navigate to: **Databases** → `68efd8c400255230a04a` → **Create Collection**
3. Collection ID: `teams` (lowercase, exact)
4. Click **Create**

### Step 2: Add Attributes (2 min)
Click **Add Attribute** for each:

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| teamName | String | 100 | ✅ Yes |
| teamCode | String | 20 | ✅ Yes |
| password | String | 100 | ✅ Yes |

### Step 3: Set Permissions (30 sec)
- **Read**: `role:any` (Important!)
- **Create/Update/Delete**: `role:users` or admin role

### Step 4: Add a Test Team (30 sec)
Click **Add Document**:
```json
{
  "teamName": "Test Team",
  "teamCode": "TEST123",
  "password": "testpass123"
}
```

### Step 5: Test Login ✅
1. Go to: http://localhost:3000/login
2. Switch to Team Login
3. Enter:
   - Team Name: Test Team
   - Team Code: TEST123
   - Password: testpass123
4. Success! 🎉

---

## 🔧 Collection Schema

```
Collection: teams
├── teamName (String, 100 chars, Required)
├── teamCode (String, 20 chars, Required, Unique Index)
└── password (String, 100 chars, Required)

Permissions:
└── Read: role:any
```

---

## 📝 Example Team Data

```json
{
  "teamName": "Data Diggers",
  "teamCode": "DD2025",
  "password": "SecurePass123!"
}
```

```json
{
  "teamName": "Code Crushers",
  "teamCode": "CC2025",
  "password": "CrusherPass456!"
}
```

```json
{
  "teamName": "AI Avengers",
  "teamCode": "AIA2025",
  "password": "AvengerPass789!"
}
```

---

## ⚠️ Critical Checklist

- [ ] Collection ID is EXACTLY `teams` (lowercase)
- [ ] Read permission includes `role:any`
- [ ] All three attributes created
- [ ] At least one team document exists
- [ ] Tested login successfully

---

## 🐛 Quick Troubleshooting

**Error**: "Teams collection not found"
- **Fix**: Check collection ID is `teams` (lowercase)

**Error**: "Permission denied"
- **Fix**: Add `role:any` to Read permissions

**Login fails but no error**
- **Fix**: Check teamCode matches exactly (case-insensitive)

**"Invalid credentials" every time**
- **Fix**: Verify team document exists in Appwrite Console

---

## 🎯 Production Checklist

Before going live:
- [ ] Hash passwords (use bcrypt)
- [ ] Remove plain text passwords
- [ ] Implement password reset
- [ ] Add team registration form
- [ ] Create admin team management panel
- [ ] Enable HTTPS only
- [ ] Set up proper backup

---

**Need More Help?**  
📖 See: `TEAM_AUTHENTICATION_SETUP.md` for detailed guide

**Ready to Go?**  
🚀 Follow the 5-minute setup above and you're done!
