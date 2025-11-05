# Quick Start: Indoor Mission Setup

## For Admins - Set Up Questions (5 minutes)

### Step 1: Access Question Management
1. Navigate to: `http://localhost:3001/admin/questions`
2. Login with password: `nccrifat`

### Step 2: Add Your First Question
Click "Add New Question" and fill in:
- **Question**: "What is 2 + 2?"
- **Option 1**: "3"
- **Option 2**: "4" ← Select this as correct answer
- **Option 3**: "5"
- **Option 4**: "6"
- **Correct Answer**: Option 2
- **Difficulty**: Easy
- **Points**: 10

Click "Add Question"

### Step 3: Add More Questions
Repeat for as many questions as you want. Recommended: 5-10 questions

### Step 4: Preview
Click "Preview Mission" to test the player experience

## For Players - Take the Indoor Mission

### Step 1: Navigate to Game
Go to: `http://localhost:3001/game-interface`

### Step 2: Enter Indoor Mission
Click the blue "Step Inside" button in the Indoor Mission section

### Step 3: Answer Questions
1. Read each question
2. Click on your answer choice
3. Click "Submit Answer"
4. See instant feedback:
   - ✅ Green = Correct!
   - ❌ Red = Incorrect

### Step 4: Complete Mission
- Answer all questions to see your final score
- Try to get the highest score possible!

## Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| Game Interface | `/game-interface` | Main game hub |
| Indoor Mission | `/indoor-mission` | Player Q&A page |
| Admin Panel | `/admin` | Main admin dashboard |
| Question Management | `/admin/questions` | Add/edit questions |

## Tips

### For Admins
- Start with 5 easy questions to test
- Use export to backup your questions
- Vary difficulty levels for better gameplay
- Set appropriate point values (10-50 pts)

### For Players
- Read questions carefully before answering
- You can't change answers after submitting
- Higher difficulty = more points
- Check your progress bar to see completion

## Troubleshooting

**Problem**: Can't access admin pages
- **Solution**: Use password `nccrifat`

**Problem**: No questions showing
- **Solution**: Admin needs to add questions first at `/admin/questions`

**Problem**: Answers not saving
- **Solution**: Make sure localStorage is enabled in browser

---

**Ready to start?** Go to `/admin/questions` and add your first question! 🚀
