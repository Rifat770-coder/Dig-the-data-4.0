# Leaderboard Setup Guide - Appwrite Configuration

## Quick Setup Steps

### Step 1: Add Score Attribute to Teams Collection

1. **Open Appwrite Console**
   - Go to: https://cloud.appwrite.io/console
   - Login to your account

2. **Navigate to Database**
   - Click on "Databases" in the left sidebar
   - Select your database: `68efd8c400255230a04a`

3. **Open Teams Collection**
   - Find and click on the "teams" collection
   - Click the "Attributes" tab

4. **Add Score Attribute**
   - Click "+ Create attribute" button
   - Select "Integer" as the type
   - Configure as follows:

   ```
   Attribute Key: score
   Type: Integer
   Size: 64-bit (default)
   Required: No (unchecked)
   Default: 0
   Array: No (unchecked)
   Min: 0
   Max: (leave blank or set high limit like 999999)
   ```

5. **Save Attribute**
   - Click "Create" button
   - Wait for attribute to be created (may take a few seconds)
   - Verify "score" appears in the attributes list

### Step 2: Update Existing Teams (Optional)

If you have existing teams without scores:

1. Go to "Documents" tab in teams collection
2. Click on each team document
3. Add `"score": 0` field
4. Save the document

**Or use bulk update via Appwrite API:**

```javascript
// Run in browser console on Appwrite page
const teams = await databases.listDocuments('68efd8c400255230a04a', 'teams');
for (const team of teams.documents) {
  if (team.score === undefined) {
    await databases.updateDocument('68efd8c400255230a04a', 'teams', team.$id, {
      score: 0
    });
  }
}
console.log('All teams updated with default score!');
```

### Step 3: Verify Permissions

Ensure proper permissions are set on the teams collection:

**Read Permission:**
- `role:all` or `role:guests` (to allow reading teams)

**Update Permission:**
- `role:all` (to allow admin AND teams to update scores)

**IMPORTANT:** The `role:all` update permission is required for:
- Admin to manually edit scores in leaderboard
- Teams to automatically add points from indoor mission

**How to check:**
1. In teams collection, click "Settings" tab
2. Click "Permissions" section
3. Verify read and update permissions exist
4. Add if missing using "+ Add a role" button

**Security Note:** Teams can only add points (positive values), not subtract. Admins can manually correct scores if needed through the leaderboard interface.

### Step 4: Test the Leaderboard

1. **Access the leaderboard:**
   - Navigate to: http://localhost:3001/admin/leaderboard
   - Enter password: `admin123`

2. **Verify teams display:**
   - All teams should appear with score 0 (if newly added)
   - Teams should be listed in order

3. **Test score editing:**
   - Click "Edit" on any team
   - Enter a test score (e.g., 100)
   - Click save (✓)
   - Verify score updates

4. **Test ranking:**
   - Add different scores to multiple teams
   - Verify teams sort by highest score
   - Check top 3 get medal icons (🥇🥈🥉)

## Troubleshooting

### Error: "Property 'score' does not exist"
**Solution:** The score attribute hasn't been added to the collection yet. Complete Step 1 above.

### Error: "Permission denied"
**Solution:** Update permissions in Appwrite Console (see Step 3).

### Scores not saving
**Possible causes:**
1. Score attribute not added → Add it in Appwrite Console
2. Wrong data type → Ensure it's "Integer" not "String"
3. Validation error → Check score is non-negative number
4. Permission issue → Verify update permission is set

### Teams not loading
**Possible causes:**
1. Wrong DATABASE_ID → Check `.env.local` file
2. Collection doesn't exist → Verify "teams" collection exists
3. No read permission → Add `role:all` read permission
4. Admin not authenticated → Re-login to admin panel

## Verification Checklist

Before using the leaderboard, ensure:

- [ ] Score attribute exists in teams collection
- [ ] Score attribute is type "Integer"
- [ ] Score attribute allows 0 or positive values
- [ ] Teams collection has read permission
- [ ] Teams collection has update permission
- [ ] Admin panel login works (password: nccrifat)
- [ ] Leaderboard login works (password: admin123)
- [ ] Can view all teams in leaderboard
- [ ] Can edit and save team scores
- [ ] Teams sort by score correctly

## Database Schema Reference

### Teams Collection Final Structure

| Attribute | Type | Required | Default | Array | Description |
|-----------|------|----------|---------|-------|-------------|
| teamName | String | Yes | - | No | Team display name |
| teamCode | String | Yes | - | No | Unique team code (uppercase) |
| password | String | Yes | - | No | Team login password |
| memberIds | String | No | `[]` | Yes | Array of user IDs |
| **score** | **Integer** | **No** | **0** | **No** | **Team's current score** |

### Appwrite Automatic Fields
- `$id` - Unique document ID
- `$createdAt` - Timestamp of creation
- `$updatedAt` - Timestamp of last update
- `$permissions` - Document-level permissions

## Next Steps

After setup is complete:

1. **Initialize team scores:**
   - Set all teams to score 0, or
   - Import scores from previous system

2. **Configure game integration:**
   - Update indoor mission to award points
   - Connect other game sections to update scores
   - See `LEADERBOARD_FEATURE.md` for integration examples

3. **Test with real data:**
   - Create test teams in admin panel
   - Assign test scores
   - Verify leaderboard displays correctly

4. **Share access (optional):**
   - Share leaderboard password with authorized admins
   - Consider creating separate read-only public view

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check Appwrite Console for configuration
3. Review `LEADERBOARD_FEATURE.md` for detailed documentation
4. Verify all environment variables in `.env.local`

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Existing teams collection in Appwrite
