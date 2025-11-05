# 🎯 Dig The Data - Event Management Platform

A modern Next.js application with comprehensive team management, user authentication, and event organization features.

## ✨ Features

### 🏆 Team Management System
- **Create Teams**: Form teams with exactly 4 members
- **Admin Panel**: Complete control over team creation, updates, and deletion
- **Team Dashboard**: Beautiful interface showing all team members
- **Automatic Leader Assignment**: First member becomes team leader
- **Member Validation**: Prevents users from joining multiple teams

### 👥 User Management
- **User Registration**: Complete profile setup with department and contact info
- **Profile Pictures**: Upload and manage user avatars
- **bKash Integration**: Transaction verification with photo receipts
- **Search & Filter**: Advanced user search and filtering capabilities

### 🔐 Authentication
- **Multiple Login Modes**: Individual or team-based authentication
- **Admin Panel**: Password-protected administrative access
- **Session Management**: Secure team and user sessions

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful glass-effect components
- **Responsive Layout**: Works perfectly on all devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Cyan/Blue Theme**: Modern gradient color scheme

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Appwrite Database
Follow the guide: **`APPWRITE_TEAMS_COLLECTION_SETUP.md`**
- Takes 10-15 minutes
- Creates teams collection
- Sets up proper permissions

### 3. Configure Environment
Copy `.env.local` and ensure these variables are set:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
```

### 4. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📚 Documentation

### Quick Guides
- **[QUICK_START.md](QUICK_START.md)** - Get started in 3 steps (13 minutes)
- **[APPWRITE_TEAMS_COLLECTION_SETUP.md](APPWRITE_TEAMS_COLLECTION_SETUP.md)** - Database setup guide
- **[TEAM_MANAGEMENT_COMPLETE_GUIDE.md](TEAM_MANAGEMENT_COMPLETE_GUIDE.md)** - Complete feature guide
- **[PROJECT_ANALYSIS_SUMMARY.md](PROJECT_ANALYSIS_SUMMARY.md)** - Full system overview
- **[TEAM_MANAGEMENT_CHECKLIST.md](TEAM_MANAGEMENT_CHECKLIST.md)** - Implementation checklist

## 🎯 Key Pages

### `/admin` - Admin Panel
- Manage all users and teams
- Create, update, delete teams
- View statistics and analytics
- **Password:** `nccrifat`

### `/login` - Authentication
- Team login with code
- Individual user login

### `/team-dashboard` - Team Dashboard
- View team information
- See all 4 team members
- Member profiles with avatars

### `/register` - User Registration
- Complete profile setup
- Department selection
- bKash payment verification

## 🏗️ Tech Stack

- **Framework:** Next.js 15.5.5 (App Router)
- **React:** 19.1.0
- **Backend:** Appwrite Cloud
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Build:** Turbopack

## 📁 Project Structure

```
my-app/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin panel
│   ├── team-dashboard/           # Team view
│   ├── login/                    # Authentication
│   ├── register/                 # User registration
│   └── page.tsx                  # Homepage
├── lib/                          # Core libraries
│   ├── appwrite.ts               # Appwrite config
│   ├── team-api.ts               # Team CRUD operations
│   └── auth-api.ts               # Auth functions
├── components/                   # React components
│   ├── TeamLogin.tsx             # Team login
│   └── AuthModeToggle.tsx        # Auth switcher
└── public/                       # Static assets
```

## 🔑 Admin Access

**Admin Panel:** http://localhost:3000/admin  
**Password:** `nccrifat`

## 🎮 Usage Example

### Creating a Team
1. Navigate to `/admin` and login
2. Click "Teams" tab → "Create New Team"
3. Enter team details and select 4 users
4. Submit → Team created!

### Team Login
1. Navigate to `/login` → "Team Login"
2. Enter team code (e.g., "ALPHA01")
3. Access team dashboard with all members

## 🔧 Development Commands

```bash
pnpm dev      # Start development
pnpm build    # Build for production
pnpm start    # Start production
pnpm lint     # Run linter
```

## ✅ Implementation Status

- ✅ Team Management - 100% Complete
- ✅ User Management - 100% Complete
- ✅ Authentication - 100% Complete
- ✅ Admin Panel - 100% Complete
- ✅ Team Dashboard - 100% Complete
- ⏳ Appwrite Setup - Requires manual setup

## 🎨 Design Features

- Modern glassmorphism effects
- Responsive grid layouts
- Smooth animations
- Loading states
- Mobile-optimized

## 🔒 Security & Validation

- ✅ Team name: 3-50 characters
- ✅ Team code: 4-20 characters (unique)
- ✅ Exactly 4 members per team
- ✅ No user in multiple teams
- ✅ Admin password protection

## 🐛 Troubleshooting

**"Not authorized"** → Set Appwrite permissions to `role:all`  
**"Team code exists"** → Use a unique code  
**"Must have 4 members"** → Select exactly 4 users

See detailed guides for more help.

## 🚀 Ready to Start?

1. Read **[QUICK_START.md](QUICK_START.md)**
2. Setup Appwrite (10-15 min)
3. Run `pnpm dev`
4. Create your first team!

---

**Version:** 1.0.0 | **Status:** ✅ Production Ready

**Happy coding! 🎉**
