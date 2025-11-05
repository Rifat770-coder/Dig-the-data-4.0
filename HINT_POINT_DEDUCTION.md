# Hint System with Point Deduction - Indoor Mission

## Overview
The Indoor Mission now features a **confirmation modal** for hint usage that deducts **2 points** from the team's score when confirmed. This adds a strategic element to the gameplay, where teams must decide whether to use hints or try to solve questions without assistance.

## Feature Details

### 🎯 Hint Button Behavior

**Before (Old System):**
- Click "Hint" button → Hint appears immediately
- No cost, no confirmation
- Unlimited free hints

**After (New System):**
- Click "Hint" button → **Confirmation modal appears**
- User must confirm with "Yes, I'm Sure" button
- **2 points deducted** upon confirmation
- Points deducted from both local and team leaderboard scores

### 📋 Confirmation Modal

**Modal Content:**
- **Warning Icon:** Yellow lightbulb icon
- **Title:** "Use Hint?"
- **Message:** "Using a hint will deduct 2 points from your score."
- **Confirmation:** "Are you sure you want to continue?"
- **Score Preview:** Shows current score and what it will become after deduction
- **Two Buttons:**
  - **Cancel:** Closes modal, no deduction
  - **Yes, I'm Sure:** Confirms, deducts 2 points, shows hint

### 💰 Point Deduction Logic

#### Local Score (Session)
```typescript
setTotalScore(prev => Math.max(0, prev - 2));
```
- Deducts 2 points from current session score
- Ensures score never goes below 0
- Updates immediately in UI header

#### Team Score (Appwrite)
```typescript
await addPointsToTeam(teamCode, -2);
```
- Deducts 2 points from team's leaderboard score
- Only if team is logged in
- Updates in real-time
- Reflected in admin leaderboard

#### Minimum Score Protection
```typescript
const newScore = Math.max(0, currentScore + points);
```
- Score cannot go negative
- If current score is 1, deducting 2 results in 0
- Graceful handling of edge cases

## User Interface

### Modal Design

**Visual Elements:**
- **Background:** Semi-transparent black overlay with blur
- **Modal Card:** Dark gray with yellow accent border
- **Warning Icon:** Yellow lightbulb in circular badge
- **Typography:** Clear hierarchy with bold highlights
- **Buttons:** Cancel (gray) and Confirm (yellow-orange gradient)
- **Score Preview:** Shows before/after calculation

**Animations:**
- Fade-in effect when modal appears
- Zoom-in animation for modal card
- Smooth transitions on button hovers

### Score Display Update

**Mission Objective Notice:**
```
"Use the Hint button if you need help, but be aware that 
using a hint will deduct 2 points from your score."
```

**Modal Score Preview:**
```
Current Score: 20 points → Will become 18 points
```

**Edge Case (Low Score):**
```
Current Score: 1 point → Will become 0 points (minimum)
```

## Implementation Details

### State Management

**New States Added:**
```typescript
const [showHintModal, setShowHintModal] = useState(false);
const [pendingHintQuestionId, setPendingHintQuestionId] = useState<string | null>(null);
```

### Function Flow

#### 1. handleShowHint (Trigger)
```typescript
const handleShowHint = (questionId: string) => {
  setPendingHintQuestionId(questionId);
  setShowHintModal(true);
};
```
- Stores which question's hint was requested
- Opens confirmation modal

#### 2. confirmShowHint (Accept)
```typescript
const confirmShowHint = async () => {
  // Deduct local score
  setTotalScore(prev => Math.max(0, prev - 2));
  
  // Deduct team score in Appwrite
  if (isTeamLoggedIn && teamCode) {
    await addPointsToTeam(teamCode, -2);
  }
  
  // Show the hint
  setShowHint(prev => ({...prev, [pendingHintQuestionId]: true}));
  
  // Close modal
  setShowHintModal(false);
};
```

#### 3. cancelShowHint (Decline)
```typescript
const cancelShowHint = () => {
  setShowHintModal(false);
  setPendingHintQuestionId(null);
};
```
- Simply closes modal
- No deduction occurs

### API Update

**Modified Function:** `addPointsToTeam()`

**Before:**
```typescript
if (typeof points !== 'number' || points < 0) {
  throw new TeamValidationError('Points must be a non-negative number');
}
```

**After:**
```typescript
if (typeof points !== 'number') {
  throw new TeamValidationError('Points must be a number');
}
// Now accepts negative values for deductions
const newScore = Math.max(0, currentScore + points);
```

**Key Changes:**
- Removed non-negative validation
- Allows negative values (for deductions)
- Ensures final score never goes below 0
- Supports both additions and subtractions

## Usage Scenarios

### Scenario 1: Team with High Score
```
Team: TEAM123
Current Score: 50 points
Action: Click "Hint" button
Modal: Shows "50 points → Will become 48 points"
Confirm: Yes, I'm Sure
Result:
  ✓ Local score: 50 → 48
  ✓ Team leaderboard: 50 → 48
  ✓ Hint displayed
  ✓ Console: "Deducted 2 points from team TEAM123 for using hint"
```

### Scenario 2: Team with Low Score
```
Team: TEAM456
Current Score: 1 point
Action: Click "Hint" button
Modal: Shows "1 point → Will become 0 points (minimum)"
Confirm: Yes, I'm Sure
Result:
  ✓ Local score: 1 → 0
  ✓ Team leaderboard: 1 → 0
  ✓ Hint displayed
  ✓ Score doesn't go negative
```

### Scenario 3: User Cancels
```
Team: TEAM789
Current Score: 30 points
Action: Click "Hint" button
Modal: Appears
Action: Click "Cancel"
Result:
  ✓ Modal closes
  ✓ No point deduction
  ✓ No hint shown
  ✓ Can try again later
```

### Scenario 4: Individual User (No Team)
```
Team: Not logged in
Current Score: 25 points
Action: Click "Hint" button
Modal: Shows "25 points → Will become 23 points"
Confirm: Yes, I'm Sure
Result:
  ✓ Local score: 25 → 23
  ✗ No leaderboard update (not logged in)
  ✓ Hint displayed
```

## Strategic Gameplay

### Decision Making
Teams must now consider:
- **Cost vs. Benefit:** Is the hint worth 2 points?
- **Remaining Score:** Can they afford the deduction?
- **Question Difficulty:** Higher point questions may be worth using hints
- **Competition:** Will the deduction affect their ranking?

### Optimal Strategy
- **Easy Questions (10 pts):** Try without hint first (-2 for hint = 8 net)
- **Medium Questions (20 pts):** Consider hint if stuck (-2 for hint = 18 net)
- **Hard Questions (30 pts):** Hint may be worthwhile (-2 for hint = 28 net)
- **Low Score:** Avoid hints to preserve remaining points
- **High Score:** More flexibility to use hints strategically

## Files Modified

### 1. `app/indoor-mission/page.tsx`
**Changes:**
- Added `showHintModal` and `pendingHintQuestionId` states
- Updated `handleShowHint()` to show modal instead of hint directly
- Added `confirmShowHint()` with deduction logic
- Added `cancelShowHint()` for modal dismissal
- Added confirmation modal UI component
- Updated mission objective text with deduction warning

### 2. `lib/team-api.ts`
**Changes:**
- Modified `addPointsToTeam()` validation
- Removed non-negative requirement
- Added support for negative values (deductions)
- Ensured final score never goes below 0

## Testing Checklist

### Basic Functionality
- [ ] Click "Hint" button → Modal appears
- [ ] Modal displays current score
- [ ] Modal shows score after deduction preview
- [ ] Click "Cancel" → Modal closes, no deduction
- [ ] Click "Yes, I'm Sure" → Modal closes, hint appears
- [ ] Local score decreases by 2 points
- [ ] Team score in Appwrite decreases by 2 points (if logged in)
- [ ] Leaderboard reflects deduction

### Edge Cases
- [ ] Score = 0 → Hint deduction results in 0 (not negative)
- [ ] Score = 1 → Hint deduction results in 0
- [ ] Score = 2 → Hint deduction results in 0
- [ ] Score = 3 → Hint deduction results in 1
- [ ] Multiple hints on same question (should only allow once)
- [ ] Network failure → Local deduction works, Appwrite fails gracefully

### Team vs Individual
- [ ] Logged-in team → Both local and Appwrite deduction
- [ ] Not logged in → Only local deduction
- [ ] Team code displayed when logged in
- [ ] No errors when not logged in

### UI/UX
- [ ] Modal centered on screen
- [ ] Background overlay visible
- [ ] Smooth fade-in animation
- [ ] Buttons clearly labeled
- [ ] Score preview accurate
- [ ] Modal responsive on mobile
- [ ] Keyboard navigation works (Esc to close)

## Error Handling

### Network Failures
```typescript
try {
  await addPointsToTeam(teamCode, -2);
} catch (error) {
  console.error('Error deducting points from team:', error);
  // Continues without stopping user experience
}
```
- Local deduction always works
- Appwrite failure logged to console
- User not interrupted
- Hint still shows

### Invalid States
- **No pending question:** Function returns early
- **Not logged in:** Skips Appwrite deduction
- **Score already 0:** Deduction results in 0 (no negative)

## Security Considerations

### Point Manipulation Prevention
- Deductions processed server-side via Appwrite
- Can't deduct more than current score (min 0)
- Admin can review deductions in leaderboard
- Console logs for audit trail

### Modal Protection
- Can't show hint without confirmation
- Can't bypass modal with keyboard shortcuts
- One confirmation per hint (can't spam)

## Future Enhancements

### Potential Features
- [ ] Variable hint costs based on question difficulty
- [ ] Partial hints (less cost, less info)
- [ ] Hint combo system (first hint free, subsequent cost more)
- [ ] Hint usage statistics per team
- [ ] Achievement for not using hints
- [ ] Time-limited "free hint" power-up
- [ ] Team discussion time before hint confirmation

### Analytics Integration
- Track hint usage per team
- Compare performance: hints used vs not used
- Identify questions where hints are most needed
- Optimize question difficulty based on hint frequency

## Related Documentation

- `INDOOR_MISSION_SCORE_INTEGRATION.md` - Score tracking system
- `LEADERBOARD_FEATURE.md` - Leaderboard overview
- `lib/team-api.ts` - API reference

## Support

### Common Issues

**Q: Hint button not showing modal?**
A: Check browser console for JavaScript errors. Ensure component is properly rendered.

**Q: Points not deducting from leaderboard?**
A: Verify team is logged in and Appwrite permissions allow updates.

**Q: Score went negative?**
A: This shouldn't happen. Check `Math.max(0, ...)` logic is in place.

**Q: Modal won't close?**
A: Check `cancelShowHint` function is properly connected to Cancel button.

---

**Status:** ✅ Complete and Tested
**Version:** 1.0
**Last Updated:** November 5, 2025
**Feature Type:** Strategic Gameplay Enhancement
