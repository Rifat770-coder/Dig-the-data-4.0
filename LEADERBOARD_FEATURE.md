# Leaderboard Feature - Real-Time Team Score Tracking

## Overview
The Leaderboard page provides admin-only access to view and manage real-time team scores stored in Appwrite. This feature enables tracking competition progress and displaying rankings.

## Access Information

### URL
**`/admin/leaderboard`**

### Authentication
- **Password:** `admin123`
- **Session Storage Key:** `adminLeaderboardAuth`
- **Access Level:** Admin only

## Features

### 📊 Real-Time Display
- **Auto-refresh:** Updates every 10 seconds (toggle on/off)
- **Manual refresh:** Instant refresh button
- **Live scores:** Directly reads from Appwrite database

### 🏆 Ranking System
- **1st Place:** 🥇 Gold gradient background
- **2nd Place:** 🥈 Silver gradient background
- **3rd Place:** 🥉 Bronze gradient background
- **Other Teams:** Cyan gradient background
- **Sorted by:** Highest score first, then alphabetically

### 📈 Statistics Dashboard
- **Total Teams:** Count of all teams
- **Highest Score:** Top team's current score
- **Average Score:** Mean score across all teams

### ✏️ Score Management
- **Edit scores:** Click "Edit" button on any team
- **Inline editing:** Type new score directly in the list
- **Validation:** Only non-negative numbers allowed
- **Save/Cancel:** Confirm or discard changes
- **Real-time update:** Changes reflect immediately

## Database Schema

### Teams Collection Update
The `score` field has been added to the Team interface:

```typescript
interface Team {
  $id?: string;
  teamName: string;
  teamCode: string;
  password: string;
  memberIds?: string[];
  score?: number;          // NEW: Team's current score
  $createdAt?: string;
  $updatedAt?: string;
}
```

### Appwrite Configuration Required

**IMPORTANT:** You must add the `score` attribute to your teams collection:

1. Go to Appwrite Console
2. Navigate to Database → teams collection
3. Click "Attributes" tab
4. Add new attribute:
   - **Key:** `score`
   - **Type:** Integer
   - **Size:** Default (64-bit)
   - **Required:** No
   - **Default:** 0
   - **Array:** No

## API Functions

### New Functions in `lib/team-api.ts`

#### 1. Update Team Score
```typescript
updateTeamScore(teamId: string, score: number): Promise<Team>
```
- Updates a specific team's score
- Validates score is non-negative
- Requires admin permission
- Returns updated team object

#### 2. Get Teams by Score
```typescript
getTeamsByScore(): Promise<Team[]>
```
- Fetches all teams sorted by score (descending)
- Secondary sort by team name (alphabetical)
- Requires admin permission
- Returns array of teams

## Usage Guide

### Access the Leaderboard

1. Login to admin panel at `/admin`
2. Click "🏆 Leaderboard" button in header
3. Enter password: `admin123`
4. View real-time team rankings

### Update Team Scores

1. Find the team in the leaderboard
2. Click the "Edit" button next to their score
3. Type the new score value
4. Click "✓" to save or "✕" to cancel
5. Score updates immediately in database

### Enable/Disable Auto-Refresh

1. Click the "🔄 Auto" button to enable (refreshes every 10s)
2. Click "⏸️ Manual" to disable auto-refresh
3. Use "↻ Refresh" button for manual updates

## Integration with Game Mechanics

### Score Sources
Teams can earn points from various game sections:
- **Indoor Mission:** Text-answer questions with points
- **Outdoor Tasks:** Mission completion rewards
- **Bonus Challenges:** Special event scoring
- **Admin Manual Entry:** Direct score adjustments

### Future Enhancements
To automatically update scores from game interactions:

```typescript
// Example: After indoor mission answer
import { updateTeamScore } from '@/lib/team-api';

const handleCorrectAnswer = async (teamId: string, points: number) => {
  const team = await getTeamById(teamId);
  const newScore = (team.score || 0) + points;
  await updateTeamScore(teamId, newScore);
};
```

## Security Features

- ✅ Session-based authentication
- ✅ Password protection
- ✅ Admin-only access (server-side validation)
- ✅ Input validation (non-negative numbers)
- ✅ Protected API endpoints

## UI Components

### Header Section
- Trophy icon branding
- Title and description
- Auto-refresh toggle
- Manual refresh button
- Navigation to admin panel
- Logout button

### Statistics Cards
- Gradient backgrounds with themed colors
- Large, readable numbers
- Uppercase labels
- Responsive grid layout (3 columns on desktop)

### Leaderboard List
- Team ranking with emoji medals (1st/2nd/3rd)
- Team name and code
- Member count display
- Current score (large, bold)
- Edit button for score modification
- Gradient backgrounds based on rank
- Hover effects for interactivity

### Empty State
- Chart emoji (📊)
- "No teams yet" message
- Centered, clean design

## Files Modified

### New Files
- `app/admin/leaderboard/page.tsx` - Leaderboard UI component

### Updated Files
- `lib/team-api.ts` - Added score field and functions
- `app/admin/page.tsx` - Added leaderboard navigation button

## Testing Checklist

- [ ] Access leaderboard with correct password
- [ ] View all teams with scores
- [ ] Edit a team's score
- [ ] Verify score updates in database
- [ ] Test auto-refresh functionality (10s interval)
- [ ] Test manual refresh button
- [ ] Verify ranking order (highest to lowest)
- [ ] Check medal icons for top 3 teams
- [ ] Test with 0 teams (empty state)
- [ ] Test logout functionality
- [ ] Verify statistics calculations (total, highest, average)

## Permissions Required

Ensure Appwrite permissions are set correctly:

**Teams Collection:**
- Read: `role:all` or `role:guests`
- Update: `role:all` (for score updates)

**Note:** Admin authentication is handled client-side with session storage. For production, implement proper role-based access control.

## Troubleshooting

### Score not updating
- Check if `score` attribute exists in teams collection
- Verify Appwrite update permissions
- Check browser console for errors
- Ensure admin session is valid

### Leaderboard not loading
- Verify teams collection exists
- Check Appwrite read permissions
- Ensure DATABASE_ID is correct in config
- Check network tab for API errors

### Auto-refresh not working
- Verify component is mounted
- Check `autoRefresh` state
- Ensure no JavaScript errors in console
- Try manual refresh to test connection

## Styling Details

- **Background:** Gradient from gray-900 via blue-900 to gray-900
- **Cards:** Glassmorphism effect with backdrop blur
- **Borders:** Cyan and themed color gradients
- **Typography:** Bold headlines, clear hierarchy
- **Animations:** Hover scale effects, loading spinners
- **Responsive:** Mobile-friendly with column stacking

## Future Roadmap

### Phase 1 (Current)
✅ Basic leaderboard display
✅ Manual score editing
✅ Auto-refresh functionality
✅ Top 3 ranking highlights

### Phase 2 (Planned)
- [ ] Score change history/audit log
- [ ] Real-time WebSocket updates (no polling)
- [ ] Export leaderboard to CSV/PDF
- [ ] Filter by score range
- [ ] Search teams in leaderboard

### Phase 3 (Advanced)
- [ ] Public leaderboard view (read-only for participants)
- [ ] Team progress graphs
- [ ] Score breakdown by game section
- [ ] Achievement badges
- [ ] Live commentary/announcements

## Related Documentation

- `APPWRITE_SETUP_GUIDE.md` - Database configuration
- `lib/team-api.ts` - Team management API
- `app/admin/page.tsx` - Admin panel overview

---

**Status:** ✅ Complete and Ready
**Version:** 1.0
**Last Updated:** November 3, 2025
**Access:** Admin Only
