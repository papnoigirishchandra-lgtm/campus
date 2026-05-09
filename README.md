# Campus Companion

A full-stack academic management system for students, teachers, and admins, built with React, Vite, Express, MongoDB, Socket.IO, JWT, and Firebase Authentication.

## Project Structure

```text
campus/
  frontend/      Vite + React client
  backend/       Express API, MongoDB models, Socket.IO server
  vercel.json    Vercel config for deploying the frontend from repo root
```

## Local Setup

Install dependencies:

```bash
npm run install-all
```

Create environment files from the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Start both apps:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Firebase Auth

In Firebase Console, enable:

- Email/Password provider
- Google provider

For the backend Firebase Admin SDK, add either `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_CLIENT_EMAIL` plus `FIREBASE_PRIVATE_KEY` to `backend/.env`.

## Vercel Deployment

This repo is configured to deploy the frontend and Express API together on Vercel from the repository root.

Vercel settings can stay simple:

```text
Framework Preset: Other
Install Command: npm install
Build Command: npm run build
Output Directory: frontend/dist
```

The included `vercel.json` already sets those values and routes `/api/*` requests to the Express app.

Set these Vercel environment variables:

```text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=campus-c7907
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_web_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Leave `VITE_API_URL` blank on Vercel when the API is deployed in this same project. The frontend will call the same-origin `/api` routes automatically.

Note: Vercel serverless functions do not run a persistent Socket.IO server. The app disables realtime sockets on Vercel unless `VITE_SOCKET_URL` is set, so normal API features work but live dashboard refreshes are not persistent there.

## Useful Scripts

```bash
npm run install-all
npm run dev
cd frontend && npm run build
cd backend && npm start
```

## Test Accounts

After seeding the database:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@campus.com | password123 |
| Teacher | alice@teacher.com | password123 |
| Student | student1@campus.com | password123 |
