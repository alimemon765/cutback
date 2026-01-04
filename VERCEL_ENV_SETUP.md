# Fix: "Invalid API key" Error in Vercel

This error occurs when Supabase environment variables are not properly configured in Vercel.

## Quick Fix Steps

### 1. Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your **CutBack** project

### 2. Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

#### Required Variables:

**Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://tuqodkaweecctmnitaxu.supabase.co`
- **Environment**: Select **Production**, **Preview**, and **Development**

**Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (starts with `eyJhbGci...`)
- **Environment**: Select **Production**, **Preview**, and **Development**

#### How to Get Your Supabase Keys:

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** (under "Project API keys") → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Important Notes

- ✅ **No spaces** before or after the values
- ✅ **No quotes** around the values (unless the value itself contains quotes)
- ✅ Select **all environments** (Production, Preview, Development) when adding
- ✅ Values are **case-sensitive**

### 4. Redeploy After Adding Variables

**IMPORTANT**: After adding environment variables, you **MUST** redeploy:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for the deployment to complete

OR

1. Make a small change to your code
2. Push to GitHub
3. Vercel will automatically redeploy

### 5. Verify Variables Are Set

After redeploying, verify the variables are loaded:

1. Go to your deployment
2. Check the **Functions** tab
3. Or check the browser console - the error should be gone

## Optional but Recommended Variables

You can also add these for full functionality:

**Variable 3:**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service role key (keep this secret!)
- **Environment**: All environments

**Variable 4:**
- **Key**: `RESEND_API_KEY`
- **Value**: Your Resend API key (starts with `re_...`)
- **Environment**: All environments

**Variable 5:**
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- **Environment**: All environments

## Testing

After redeploying with the environment variables:

1. Go to your Vercel deployment URL
2. Try to sign up again
3. The "Invalid API key" error should be gone
4. Sign up/login should work correctly

## Still Getting Errors?

If you're still getting the error after adding variables and redeploying:

1. **Double-check the values**:
   - Go back to Supabase dashboard
   - Copy the keys again (they might have changed)
   - Make sure there are no extra spaces

2. **Verify deployment used the variables**:
   - Check deployment logs in Vercel
   - Look for any warnings about missing environment variables

3. **Check the environment**:
   - Make sure you selected the correct environment (Production/Preview/Development)
   - The variables must match the environment you're accessing

4. **Clear browser cache**:
   - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
   - Or use incognito/private browsing

## Example Values (DO NOT USE THESE - USE YOUR OWN!)

```
NEXT_PUBLIC_SUPABASE_URL=https://tuqodkaweecctmnitaxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cW9ka2F3ZWVjY3Rtbml0YXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5OTk5OTksImV4cCI6MjAyNTU3NTk5OX0.example
```

**Remember**: These are examples. Use your actual values from your Supabase project!

---

**Status**: Follow these steps to fix the "Invalid API key" error.

