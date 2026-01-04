# Vercel Deployment Checklist

Quick checklist for deploying CutBack to Vercel.

## Pre-Deployment ✅

- [x] Project builds successfully (`npm run build`)
- [x] All TypeScript errors fixed
- [x] All ESLint errors fixed
- [x] `vercel.json` created
- [x] `.env.example` created for reference

## Deployment Steps

### 1. GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or Vercel has access

### 2. Vercel Project Setup
- [ ] Create new project on Vercel
- [ ] Import GitHub repository
- [ ] Vercel auto-detects Next.js (verify settings)

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (required)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (optional but recommended)
- [ ] `RESEND_API_KEY` (optional)
- [ ] `NEXT_PUBLIC_APP_URL` (set to your Vercel URL after first deployment)

**Important:** Set variables for Production, Preview, and Development environments.

### 4. Supabase Configuration
- [ ] Update Supabase Auth redirect URLs:
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/auth/callback`
- [ ] Verify storage bucket `videos` exists and is private
- [ ] Test RLS policies work correctly

### 5. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Note your deployment URL

### 6. Post-Deployment
- [ ] Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
- [ ] Redeploy after updating `NEXT_PUBLIC_APP_URL`
- [ ] Test all features:
  - [ ] Homepage loads
  - [ ] Sign up works
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Create project
  - [ ] Upload video
  - [ ] Generate share link
  - [ ] Review page works
  - [ ] Comments work

## Quick Deploy Command (CLI)

If using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Environment Variables Quick Copy

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Fill in the values and add to Vercel dashboard.

---

**Status**: Ready to deploy! 🚀

