# Supabase Email Confirmation Setup

## Issue: Signup Taking Too Long

If signup is hanging or taking too long, it's likely because **email confirmation is enabled** in Supabase.

## Solution: Disable Email Confirmation (For Development)

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`tuqodkaweecctmnitaxu`)
3. Go to **Authentication** → **Settings** (in the left sidebar)
4. Scroll down to **Email Auth** section
5. Find **"Enable email confirmations"**
6. **Toggle it OFF** (disable it)
7. Click **Save**

### Why This Helps:

- With email confirmation **enabled**: Users must click a link in their email before they can sign in
- With email confirmation **disabled**: Users can sign in immediately after signup (better for development)

### After Disabling:

1. Try signing up again
2. You should be redirected to the dashboard immediately
3. No email confirmation needed

## Alternative: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled:

1. Sign up with your email
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Then you can sign in

The signup form will now show a message telling you to check your email if confirmation is required.

## For Production:

- **Enable** email confirmation for security
- Users will receive confirmation emails
- They must click the link to activate their account




