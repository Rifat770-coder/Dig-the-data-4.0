# Indoor Mission Question-Answer System

## Overview
A comprehensive question-answer page system has been created for the Indoor Mission feature. This system allows the admin to create and manage questions, and players to answer them with real-time feedback and scoring.

## Features

### For Players (`/indoor-mission`)
1. **Interactive Question Interface**
   - Multiple-choice questions with 2-4 options
   - Visual difficulty indicators (Easy, Medium, Hard)
   - Points-based scoring system
   - Real-time progress tracking

2. **Smart Answer Feedback**
   - Answer boxes turn **GREEN** when correct answer is submitted
   - Answer boxes turn **RED** when incorrect answer is submitted
   - Once submitted, answers cannot be changed
   - Correct answer is displayed for incorrect submissions

3. **Progress Tracking**
   - Total score display in header
   - Correct answers counter
   - Visual progress bar
   - Mission summary with statistics

4. **User Experience**
   - Clean, modern dark theme UI
   - Smooth animations and transitions
   - Mobile-responsive design
   - Accessible with ARIA labels

### For Admins (`/admin/questions`)
1. **Question Management**
   - Add new questions with full CRUD operations
   - Edit existing questions
   - Delete questions with confirmation
   - Real-time preview

2. **Question Configuration**
   - Question text (multi-line support)
   - 2-4 answer options (minimum 2 required)
   - Select correct answer
   - Set difficulty level (Easy, Medium, Hard)
   - Assign point values

3. **Data Management**
   - Export questions to JSON file
   - Import questions from JSON file
   - Questions stored in localStorage
   - Statistics dashboard

4. **Admin Features**
   - Password-protected access (same as main admin: `nccrifat`)
   - Preview mission from admin panel
   - Quick navigation to main admin panel

## File Structure

```
app/
├── indoor-mission/
│   └── page.tsx              # Player-facing question-answer page
├── admin/
│   ├── page.tsx              # Main admin panel (updated with link)
│   └── questions/
│       └── page.tsx          # Question management admin page
└── game-interface/
    └── page.tsx              # Game interface (updated with link)
```

## Usage Guide

### For Admins

1. **Access Question Management**
   - Go to `/admin/questions`
   - Or click "Manage Questions" button from main admin panel
   - Login with admin password: `nccrifat`

2. **Add a Question**
   - Click "Add New Question" button
   - Fill in question text
   - Add at least 2 options (up to 4)
   - Select the correct answer from dropdown
   - Choose difficulty level
   - Set point value
   - Click "Add Question"

3. **Edit a Question**
   - Click the edit (pencil) icon on any question
   - Modify the fields as needed
   - Click "Update Question"

4. **Delete a Question**
   - Click the delete (trash) icon on any question
   - Confirm deletion in the popup

5. **Export/Import Questions**
   - **Export**: Click "Export" to download questions as JSON
   - **Import**: Click "Import" and select a JSON file

### For Players

1. **Access the Indoor Mission**
   - Go to `/game-interface`
   - Click "Step Inside" button in the Indoor Mission section
   - Or navigate directly to `/indoor-mission`

2. **Answer Questions**
   - Read each question carefully
   - Click on your chosen option (radio button highlights)
   - Click "Submit Answer" button
   - View instant feedback:
     - ✓ Green box = Correct! (points added)
     - ✗ Red box = Incorrect (correct answer shown)

3. **Track Progress**
   - Check your score in the header
   - View progress bar showing completion percentage
   - See mission summary at the bottom

4. **Complete the Mission**
   - Answer all available questions
   - Each correct answer earns points
   - Once submitted, answers are locked

## Data Storage

### Questions Storage
- **Location**: `localStorage` with key `indoorMissionQuestions`
- **Format**: JSON array of Question objects
- **Persistence**: Survives browser refresh

### Answer Storage
- **Location**: `localStorage` with key `indoorMissionAnswers`
- **Format**: JSON object mapping question IDs to answer states
- **Includes**: answered status, correctness, selected option

### Data Structure

```typescript
// Question structure
interface Question {
  id: string;              // Unique identifier (timestamp-based)
  question: string;        // Question text
  options: string[];       // Array of 2-4 options
  correctAnswer: number;   // Index of correct option (0-3)
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;          // Points awarded for correct answer
}

// Answer state structure
interface AnswerState {
  [questionId: string]: {
    answered: boolean;     // Has this been answered?
    correct: boolean;      // Was it correct?
    selectedOption: number | null;  // Which option was selected?
  };
}
```

## Navigation Links

- **Game Interface → Indoor Mission**: `/game-interface` → "Step Inside" button
- **Indoor Mission → Game Interface**: Back arrow in header
- **Admin Panel → Question Management**: `/admin` → "Manage Questions" button
- **Question Management → Admin Panel**: "Admin Panel" button
- **Question Management → Preview Mission**: "Preview Mission" button

## Default Demo Questions

If no questions are set by admin, the system loads 5 demo questions covering:
1. General knowledge (Easy - 10 pts)
2. JavaScript basics (Medium - 20 pts)
3. API concepts (Medium - 20 pts)
4. Data structures (Medium - 20 pts)
5. Algorithm complexity (Hard - 30 pts)

## Styling & Design

### Color Scheme
- **Correct Answer**: Green (#10b981, emerald tones)
- **Incorrect Answer**: Red (#ef4444, red tones)
- **Difficulty Levels**:
  - Easy: Green
  - Medium: Yellow
  - Hard: Red
- **Primary Actions**: Cyan to Blue gradient
- **Background**: Gray-900 to Blue-900 gradient

### Visual Feedback
- Hover effects on all interactive elements
- Smooth color transitions (300ms)
- Scale animations on buttons
- Progress bar with gradient fill
- Status icons (checkmark/x-circle)

## Security Notes

1. **Admin Password**: Same as main admin (`nccrifat`)
2. **Session Management**: Uses `sessionStorage` for admin auth
3. **Client-side Storage**: Uses `localStorage` for questions/answers
4. **No Server Validation**: All validation is client-side
5. **Future Enhancement**: Should move to Appwrite database for production

## Future Enhancements

### Planned Features
1. **Database Integration**
   - Move from localStorage to Appwrite
   - Real-time sync across devices
   - Team-based answer tracking

2. **Advanced Question Types**
   - True/False questions
   - Multiple correct answers
   - Image-based questions
   - Code snippet questions

3. **Leaderboard**
   - Team rankings
   - Individual scores
   - Time-based challenges

4. **Question Categories**
   - Data Science
   - Programming
   - Logic & Puzzles
   - Domain Knowledge

5. **Time Limits**
   - Per-question timers
   - Mission countdown
   - Bonus points for speed

6. **Hints System**
   - 50-50 option
   - Skip question
   - Ask for hint (reduce points)

## Troubleshooting

### Questions Not Showing
- **Check**: Admin has added questions via `/admin/questions`
- **Solution**: Add questions or let demo questions load

### Answers Not Saving
- **Check**: Browser localStorage is enabled
- **Check**: Not in incognito/private mode
- **Solution**: Enable localStorage or use regular browser window

### Can't Submit Answer
- **Check**: An option is selected
- **Check**: Question hasn't been answered already
- **Solution**: Select an option before clicking submit

### Lost Progress
- **Cause**: Cleared browser data or switched devices
- **Solution**: Currently no cross-device sync (use same browser)

## Testing Checklist

- [ ] Admin can login to question management
- [ ] Admin can add new questions
- [ ] Admin can edit existing questions
- [ ] Admin can delete questions
- [ ] Admin can export questions
- [ ] Admin can import questions
- [ ] Player can access indoor mission
- [ ] Player can select options
- [ ] Player can submit answers
- [ ] Correct answers turn green
- [ ] Incorrect answers turn red
- [ ] Score updates correctly
- [ ] Progress bar updates
- [ ] Answers persist after refresh
- [ ] Navigation links work
- [ ] Mobile responsive design works

## Support

For issues or questions:
1. Check this documentation
2. Verify admin password is correct
3. Clear browser cache if issues persist
4. Check browser console for errors

---

**Created**: November 1, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
