# Dig The Data - Authentication & Database Setup Guide

## 📋 Project Overview

This Next.js application integrates **Appwrite** for backend authentication and database management. Users can register, login, and access their personalized profiles.

## 🏗️ Architecture

### Authentication Flow
1. **Registration**: User creates account → Appwrite Auth creates user → Data saved to database
2. **Login**: User enters credentials → Appwrite Auth validates → Session created
3. **Profile Access**: Logged-in users can view their registration details

### Database Structure
- **Database ID**: `68efd8c400255230a04a`
- **Collection ID**: `15` (User Registration Data)
- **Collection Schema**:
  - `name` (String) - Full name
  - `email` (String) - Email address
  - `userId` (String) - Student/User ID
  - `department` (String) - Department name
  - `Phone` (Integer) - Phone number
  - `bkashTransactionId` (String) - Payment transaction ID
  - `createdAt` (DateTime) - Registration timestamp

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68efd81f00170987dcdc
```

## 📁 File Structure

```
my-app/
├── app/
│   ├── register/
│   │   └── page.tsx          # Registration page with Appwrite Auth
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── profile/
│   │   └── page.tsx          # User profile page
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── page.tsx              # Home page
├── lib/
│   └── appwrite.ts           # Appwrite configuration
└── .env.local                # Environment variables
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install appwrite
```

### 2. Configure Appwrite Project

#### In Appwrite Console:
1. Go to **Auth** → Enable Email/Password authentication
2. Go to **Databases** → Create/verify database `68efd8c400255230a04a`
3. Create collection `15` with the schema mentioned above
4. Set appropriate permissions:
   - **Create**: Users (for registration)
   - **Read**: Users (logged-in users can read)
   - **Update**: Users (optional)
   - **Delete**: Admins only

### 3. Update Collection Permissions

In Appwrite Console → Database → Collection "15" → Settings → Permissions:

**Create Permissions**:
- `role:guest` (Allow anyone to register)

**Read Permissions**:
- `role:member` (Logged-in users can read their data)

**Update Permissions**:
- `role:member` (Optional: users can update their profile)

**Delete Permissions**:
- `role:admin` or specific user IDs (Admin only)

### 4. Run the Application
```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🔐 User Flow

### Registration Process
1. User navigates to `/register`
2. Fills out form with:
   - Name, Email, ID, Department, Phone, bKash Transaction ID
   - Password (min 8 characters)
   - Password confirmation
3. System creates:
   - Appwrite Auth user account
   - Database record with user details
4. Redirects to `/login`

### Login Process
1. User navigates to `/login`
2. Enters email and password
3. Appwrite Auth validates credentials
4. Creates session
5. Redirects to `/profile`

### Profile Access
1. User must be logged in
2. System fetches:
   - Auth user data (from Appwrite Auth)
   - Registration details (from database)
3. Displays comprehensive profile information
4. User can logout (destroys session)

## 🛠️ Key Features

### ✅ Implemented
- **Appwrite Authentication**: Email/password login system
- **User Registration**: Creates both auth user and database record
- **Secure Sessions**: Session-based authentication
- **User Profiles**: Personalized dashboard for each user
- **Admin Dashboard**: View and manage all registrations
- **Password Protection**: Minimum 8 characters, confirmation required
- **Form Validation**: Client-side validation for all inputs

### 🔒 Security Features
- Password strength validation
- Email verification ready (enable in Appwrite)
- Session management
- Protected routes (profile requires authentication)
- Admin password protection

## 📝 Important Notes

### TSConfig Configuration
The `tsconfig.json` is properly configured with:
- Path aliases: `@/*` maps to project root
- Next.js plugin enabled
- Strict mode enabled for better type safety

### Known Issues & Solutions

**Issue**: "Cannot find module '@/lib/appwrite'"
- **Solution**: Ensure `tsconfig.json` has `"paths": { "@/*": ["./*"] }`

**Issue**: Appwrite authentication errors
- **Solution**: Verify project ID and endpoint in `.env.local`

**Issue**: Database write errors
- **Solution**: Check collection permissions in Appwrite Console

## 🧪 Testing the System

### Test Registration
1. Go to `/register`
2. Fill out form with test data
3. Check Appwrite Console → Auth (user should appear)
4. Check Appwrite Console → Database (record should exist)

### Test Login
1. Go to `/login`
2. Use registered email and password
3. Should redirect to `/profile`
4. Profile should display registration details

### Test Profile Access
1. Try accessing `/profile` without logging in
2. Should redirect to `/login`
3. After login, profile should be accessible

## 🎯 Next Steps / Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Profile editing capabilities
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] User dashboard with statistics
- [ ] Event registration status tracking

## 🆘 Troubleshooting

### Appwrite SDK Not Found
```bash
npm install appwrite
```

### TypeScript Errors
```bash
# Rebuild the project
npm run build
```

### Session Not Persisting
- Check browser cookies
- Verify Appwrite endpoint is HTTPS
- Check CORS settings in Appwrite Console

## 📞 Support

For issues related to:
- **Appwrite**: [Appwrite Documentation](https://appwrite.io/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
