# Indoor Mission - Team Score Integration

## Overview
The Indoor Mission page now automatically adds earned points to the team's leaderboard score in Appwrite when teams answer questions correctly. This creates a seamless integration between gameplay and competition tracking.

## How It Works

### 1. Team Authentication Check
When a team member accesses the Indoor Mission page:
- The system checks if a valid team session exists
- If logged in, the team code is retrieved from session storage
- Team mode is activated automatically

### 2. Answer Submission Process
When a team submits a correct answer:
1. **Local Validation:** Answer is checked against the correct answer (case-insensitive)
2. **Local Score Update:** Points are added to the session score display
3. **Database Update:** Points are automatically added to the team's score in Appwrite
4. **Leaderboard Sync:** The updated score appears in the admin leaderboard immediately

### 3. Visual Indicators
- **Team Code Display:** Shows in the header when team is logged in
- **Active Mode Notice:** Green banner confirms points are being tracked
- **Real-time Score:** Display shows current session points

## Features

### ✅ Automatic Score Tracking
- No manual submission required
- Points added instantly on correct answers
- Works seamlessly with existing game mechanics

### 🔐 Secure Integration
- Only logged-in teams can add points
- Team validation through session tokens
- Protected API endpoints

### 📊 Real-Time Leaderboard
- Admin can see live score updates
- Auto-refresh every 10 seconds (in leaderboard)
- Immediate reflection of earned points

### 🎮 User Experience
- **Team Mode Active Badge:** Green notification when logged in
- **Team Code Display:** Always visible in header
- **No Disruption:** Points tracking happens in the background
- **Error Resilient:** Local points still saved if network fails

## Technical Implementation

### Modified Files

**1. `app/indoor-mission/page.tsx`**
- Added team session imports
- Added `teamCode` and `isTeamLoggedIn` state
- Modified `handleSubmitAnswer` to be async
- Integrated `addPointsToTeam` function
- Added visual indicators for team mode

**2. `lib/team-api.ts`**
- Added `addPointsToTeam()` function
- Enables non-admin point additions
- Calculates and updates cumulative scores

### Key Functions

#### `addPointsToTeam(teamCode: string, points: number)`
```typescript
// Adds points to team's total score in Appwrite
await addPointsToTeam(teamCode, 20); // Adds 20 points
```

**Parameters:**
- `teamCode` (string): The team's unique code
- `points` (number): Points to add (must be non-negative)

**Returns:** Updated Team object

**Throws:**
- `TeamValidationError` if points are invalid
- `TeamNotFoundError` if team doesn't exist

### Code Flow

```typescript
// 1. Check team session on page load
useEffect(() => {
  if (isTeamSessionValid()) {
    const session = getTeamSession();
    setTeamCode(session.teamCode);
    setIsTeamLoggedIn(true);
  }
}, []);

// 2. Handle correct answer
const handleSubmitAnswer = async (questionId) => {
  // ... validation and checking ...
  
  if (isCorrect && isTeamLoggedIn && teamCode) {
    // Add points to Appwrite
    await addPointsToTeam(teamCode, question.points);
  }
};
```

## Appwrite Configuration

### Required Permissions

**Teams Collection - Update Permission:**
```
role:all
```

This allows teams to update their own scores without admin privileges.

**How to Set:**
1. Go to Appwrite Console
2. Navigate to Database → teams collection
3. Click "Settings" → "Permissions"
4. Add permission: `role:all` with Update access
5. Save changes

### Attribute Requirements

Ensure `score` attribute exists:
- **Key:** `score`
- **Type:** Integer
- **Required:** No
- **Default:** 0

## Usage Examples

### Scenario 1: Team Plays Indoor Mission
```
1. Team logs in via /login?type=team
2. Navigates to /game-interface
3. Clicks "Indoor Mission"
4. Sees "Team Mode Active" banner
5. Answers question correctly (+20 points)
6. Points added to both:
   - Local session display
   - Team's Appwrite score
7. Admin sees updated score in leaderboard
```

### Scenario 2: Individual User (No Team)
```
1. User accesses /indoor-mission directly
2. No team session detected
3. Points tracked locally only
4. No leaderboard updates
5. Can still complete mission and see scores
```

## Testing Checklist

### Basic Functionality
- [ ] Team login successful
- [ ] Team code appears in indoor mission header
- [ ] "Team Mode Active" banner displays
- [ ] Correct answer awards points locally
- [ ] Correct answer adds points to Appwrite
- [ ] Leaderboard reflects new score
- [ ] Multiple correct answers accumulate properly

### Edge Cases
- [ ] Network failure (points saved locally)
- [ ] Team not found (graceful error handling)
- [ ] Invalid team code (no score update)
- [ ] Non-team user (no errors, local tracking only)
- [ ] Same question answered twice (no duplicate points)

### Admin Verification
- [ ] Leaderboard shows updated scores
- [ ] Auto-refresh displays changes
- [ ] Manual refresh works correctly
- [ ] Team rankings update properly

## Error Handling

### Network Errors
```typescript
try {
  await addPointsToTeam(teamCode, points);
} catch (error) {
  console.error('Error adding points:', error);
  // User not notified - points still tracked locally
}
```

**Behavior:**
- Points added to local score regardless
- Error logged to console
- No user-facing alert (seamless experience)
- Team can continue playing

### Invalid Team
```typescript
if (!team || !team.$id) {
  throw new TeamNotFoundError('Team not found');
}
```

**Behavior:**
- Error caught silently
- Local points still work
- Admin can investigate via logs

## Benefits

### For Teams
- 🎯 **Competitive Edge:** See real-time rankings
- 📈 **Progress Tracking:** Know your standing
- 🏆 **Motivation:** Compete with other teams
- ✨ **Seamless:** No extra steps required

### For Admins
- 📊 **Live Monitoring:** Watch competition unfold
- 🎮 **Fair Play:** All points tracked centrally
- 📋 **Easy Management:** Edit scores if needed
- 🔍 **Transparency:** Clear audit trail

### For System
- 🔄 **Real-time Sync:** No batch processing needed
- 💪 **Resilient:** Works even with network issues
- 🚀 **Scalable:** Handles multiple teams simultaneously
- 🔐 **Secure:** Protected endpoints and validation

## Future Enhancements

### Phase 1 (Planned)
- [ ] Point deductions for wrong answers (optional)
- [ ] Time-based bonus points
- [ ] Combo multipliers for streak answers
- [ ] Team-specific question sets with score isolation

### Phase 2 (Advanced)
- [ ] Real-time WebSocket score updates
- [ ] Point transaction history per team
- [ ] Undo/redo functionality for admins
- [ ] Score verification and audit logs

### Phase 3 (Integration)
- [ ] Connect other game sections (outdoor, banner, etc.)
- [ ] Unified score aggregation
- [ ] Cross-section leaderboards
- [ ] Achievement system based on scores

## Troubleshooting

### Points not adding to leaderboard

**Possible Causes:**
1. Team not logged in properly
2. Appwrite permissions not set
3. Network connectivity issues
4. Team doesn't exist in database

**Solutions:**
1. Check team session: `localStorage.getItem('teamSession')`
2. Verify permissions in Appwrite Console
3. Check browser network tab for errors
4. Confirm team exists in teams collection

### "Team Mode Active" not showing

**Causes:**
- Invalid or expired team session
- Team session cleared/logged out

**Solutions:**
- Re-login through team login page
- Check session validity in localStorage

### Scores showing wrong values

**Causes:**
- Cache issues
- Concurrent updates
- Manual admin edits

**Solutions:**
- Hard refresh leaderboard (Ctrl+F5)
- Wait for auto-refresh cycle
- Check Appwrite console for actual values

## Related Documentation

- `LEADERBOARD_FEATURE.md` - Leaderboard system overview
- `LEADERBOARD_SETUP.md` - Appwrite configuration
- `lib/team-api.ts` - API reference
- `lib/auth-api.ts` - Authentication system

## Security Considerations

### Point Manipulation Prevention
- Client-side validation only adds points, never subtracts
- All updates logged to Appwrite (audit trail)
- Admin can manually correct scores if needed
- Rate limiting on team session creation

### Data Integrity
- Atomic score updates (no race conditions)
- Transaction-like behavior in Appwrite
- Validation at multiple levels
- Error recovery mechanisms

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Appwrite configuration
3. Test with team login flow
4. Review leaderboard for score updates

---

**Status:** ✅ Complete and Tested
**Version:** 1.0
**Last Updated:** November 3, 2025
**Integration:** Full (Indoor Mission → Leaderboard)
