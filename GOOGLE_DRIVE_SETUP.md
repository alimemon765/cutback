# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for CutBack.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `CutBack` (or your preferred name)
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing) or **Internal** (for Google Workspace)
   - App name: `CutBack`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Add `https://www.googleapis.com/auth/drive.readonly`
   - Click **Save and Continue**
   - Test users: Add your email (for testing)
   - Click **Save and Continue**

4. Create OAuth Client:
   - Application type: **Web application**
   - Name: `CutBack Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-app.vercel.app` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://your-app.vercel.app/api/auth/google/callback` (for production)
   - Click **Create**
   - **Copy the Client ID and Client Secret** - you'll need these!

## Step 4: Add Environment Variables

Add these to your `.env.local` (development) and Vercel (production):

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your Vercel URL
```

## Step 5: Install Required Packages

```bash
npm install googleapis @google-cloud/local-auth
```

## Step 6: Test the Integration

After implementing the code:
1. Go to a project
2. Click "Upload Video"
3. Select "From Google Drive"
4. Authenticate with Google
5. Select a video file
6. Verify it appears in your project

## Troubleshooting

### "Redirect URI mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches your app URL + `/api/auth/google/callback`
- Check for trailing slashes

### "Access blocked"
- Make sure you added your email as a test user (if using External user type)
- Check OAuth consent screen is configured

### "Invalid client"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure there are no extra spaces or quotes

---

**Next Steps:** After setup, implement the OAuth flow and Drive file picker.

