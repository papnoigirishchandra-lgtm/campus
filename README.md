# Campus Companion

A fully serverless, full-stack academic management system for students, teachers, and admins, built with React, Vite, Tailwind CSS, and powered by Firebase (Authentication, Firestore, Storage).

## Project Structure

This is a modern Single Page Application (SPA) with no dedicated backend server. All database interactions and role-based security are handled securely via the Firebase SDK and Firestore Security Rules.

```text
campus/
  src/
    components/      # Reusable UI components
    context/         # AuthContext for session management
    pages/           # Dashboards, Login, Profile
    services/        # firebase.js & firestoreService.js (replaces old APIs)
  .env               # Firebase configuration keys
  firestore.rules    # Database security rules
  vercel.json        # Vercel deployment configuration
```

## Local Setup

Install dependencies:

```bash
npm install
```

Set up your environment variables by creating a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Start the Vite development server:

```bash
npm run dev
```

Local URL: `http://localhost:5173`

## Firebase Setup

This application relies entirely on Firebase. You must configure a Firebase project:

1. **Authentication**: Enable Email/Password and Google Sign-in providers.
2. **Firestore Database**: Create a database and apply the rules found in `firestore.rules`.
3. **Storage**: Enable Firebase Storage for user avatars.

Update the `.env` file with your project's configuration:

```text
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Security Rules

Because this application does not use a traditional backend API, database security is enforced directly at the database level. 

To deploy the security rules that prevent students from editing grades and restrict teachers to their own courses, run:

```bash
firebase deploy --only firestore:rules
```
Or manually copy the contents of `firestore.rules` into the Firebase Console -> Firestore -> Rules tab.

## Vercel Deployment

This repository is optimized for Vercel deployment. Because there is no backend, deployment is incredibly fast and simple.

Vercel settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Ensure all `VITE_FIREBASE_*` environment variables are added to your Vercel project settings.

## Getting Started / Test Accounts

Since there is no backend seeding script, you can initialize your platform manually. We recommend creating the following accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@campus.com | password123 |
| Teacher | teacher@campus.com | password123 |
| Student | student@campus.com | password123 |

**To create these accounts:**
1. Register a new account normally (it will default to `student`).
2. Go to your Firebase Console -> Firestore Database -> `users` collection.
3. Find your user document and manually change the `role` field to `"admin"` or `"teacher"`.
4. Log back in to access the corresponding Dashboard, where admins can create other teachers, courses, and users!
