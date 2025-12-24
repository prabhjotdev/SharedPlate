# Firebase Setup Guide

This guide walks you through setting up Firebase for SharedPlate.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `sharedplate` (or your preferred name)
4. Disable Google Analytics (not needed for MVP)
5. Click **Create project**

## 2. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
   - Toggle "Enable"
   - Click Save
5. Enable **Google**
   - Toggle "Enable"
   - Enter a support email
   - Click Save

## 3. Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location closest to your users
5. Click **Enable**

## 4. Set Up Security Rules

1. Go to **Firestore Database > Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check if user email is in allowed list
    function isAllowedUser() {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/allowedUsers/$(request.auth.token.email));
    }

    // Shared recipes - only allowed users can CRUD
    match /sharedRecipes/{recipeId} {
      allow read, write: if isAllowedUser();
    }

    // Library recipes - read-only for allowed users
    match /libraryRecipes/{recipeId} {
      allow read: if isAllowedUser();
      allow write: if false; // Admin only via console
    }

    // Allowed users - users can only check their own email
    match /allowedUsers/{email} {
      allow read: if isAuthenticated() &&
        request.auth.token.email == email;
      allow write: if false; // Admin only
    }
  }
}
```

3. Click **Publish**

## 5. Add Allowed Users

1. Go to **Firestore Database > Data** tab
2. Click **Start collection**
3. Collection ID: `allowedUsers`
4. Document ID: Enter your first user's email (e.g., `sibling1@gmail.com`)
5. Add field:
   - Field: `email`
   - Type: string
   - Value: `sibling1@gmail.com`
6. Add field:
   - Field: `addedAt`
   - Type: timestamp
   - Value: (current time)
7. Click **Save**
8. Repeat for the second user's email

## 6. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **</> (Web)**
4. Register app with nickname: `sharedplate-web`
5. Copy the `firebaseConfig` object

## 7. Configure Environment Variables

1. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

2. Fill in the values from your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 8. Seed Library Recipes

You have two options to seed the library recipes:

### Option A: Using Firebase Console (Manual)

1. Go to Firestore Database
2. Create collection `libraryRecipes`
3. Manually add each recipe from `src/data/libraryRecipes.ts`

### Option B: Using a Seed Script (Recommended)

1. Install Firebase Admin SDK locally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Run the seed script:
```bash
npm run seed
```

(See `scripts/seedLibrary.js` for the script)

## 9. Deploy (Optional)

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize hosting:
```bash
firebase init hosting
```
   - Select your project
   - Public directory: `dist`
   - Single-page app: Yes
   - Don't overwrite index.html

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### "Permission denied" errors
- Check that the user's email is in `allowedUsers` collection
- Verify the email matches exactly (case-sensitive)
- Check Firestore security rules are published

### Google Sign-in not working
- Ensure Google provider is enabled in Authentication
- Add your domain to authorized domains (Authentication > Settings)

### App not loading recipes
- Check browser console for errors
- Verify `.env` file has correct values
- Ensure Firestore rules are published

## Summary

| Collection | Purpose | Access |
|------------|---------|--------|
| `allowedUsers` | Email allowlist | Read: own email only |
| `sharedRecipes` | User recipes | Read/Write: allowed users |
| `libraryRecipes` | Pre-built recipes | Read: allowed users |
