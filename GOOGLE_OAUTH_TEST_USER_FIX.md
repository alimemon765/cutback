# Fix: Google OAuth "Access Denied" Error

## Problem
Error 403: access_denied - App is in testing mode and can only be accessed by developer-approved test users.

## Solution: Add Test Users

### Step 1: Go to OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**

### Step 2: Add Test Users
1. Scroll down to **Test users** section
2. Click **+ ADD USERS**
3. Add your email address (the one you're using to sign in)
4. Click **ADD**
5. Click **SAVE** at the bottom

### Step 3: Try Again
1. Wait 1-2 minutes for changes to propagate
2. Try connecting Google Drive again
3. You should now be able to authenticate

## Alternative: Publish the App (Not Recommended for Now)

If you want anyone to use it without being added as a test user:
1. Go to **OAuth consent screen**
2. Click **PUBLISH APP**
3. **Warning**: This requires Google verification for sensitive scopes (Drive API)
4. For development/testing, adding test users is easier

## Quick Checklist
- [ ] Added your email as a test user
- [ ] Saved changes in OAuth consent screen
- [ ] Waited 1-2 minutes
- [ ] Tried connecting again

---

**Note**: You can add up to 100 test users. For production, you'll need to publish and verify the app.

