# CutBack Deployment Guide - Vercel

This guide will help you deploy CutBack to Vercel.

## Prerequisites

- ✅ Project builds successfully (`npm run build`)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Supabase project configured
- ✅ Resend API key (for email notifications)

## Step 1: Push to GitHub (if not already done)

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cutback.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (see Step 3 below)
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Optional but Recommended

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important Notes:**
- Set these for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_APP_URL` should be your Vercel deployment URL (e.g., `https://cutback.vercel.app`)
- After adding environment variables, **redeploy** your application

## Step 4: Configure Supabase for Production

### 4.1 Update Supabase Auth Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URLs:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**` (for all routes)

### 4.2 Update RLS Policies (if needed)

Your RLS policies should work as-is, but verify:
- Authenticated users can access their projects
- Public review links work correctly
- Storage policies allow video uploads

### 4.3 Storage Bucket Configuration

Ensure your `videos` bucket is configured:
- **Private** bucket (not public)
- Storage policies allow authenticated uploads
- Signed URLs work for video playback

## Step 5: Post-Deployment Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Project creation works
- [ ] Video upload works
- [ ] Share link generation works
- [ ] Review page loads (with token)
- [ ] Comments can be submitted
- [ ] All API routes respond correctly

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Supabase redirect URLs

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `npm run build` works locally

### Authentication Issues

- Verify Supabase redirect URLs include your Vercel domain
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Ensure cookies are set correctly (check browser console)

### Video Upload Fails

- Verify Supabase Storage bucket exists and is configured
- Check storage policies allow authenticated uploads
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (if using service role)

### API Routes Return 500 Errors

- Check Vercel function logs
- Verify environment variables are set correctly
- Check Supabase connection

### Share Links Don't Work

- Verify `NEXT_PUBLIC_APP_URL` is set to your Vercel deployment URL
- Check that the URL format is correct (no trailing slash)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Service role key (for admin operations) |
| `RESEND_API_KEY` | ⚠️ Optional | Resend API key (for email notifications) |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Recommended | Your Vercel deployment URL |

## Next Steps

After successful deployment:

1. Test all features thoroughly
2. Set up monitoring (Vercel Analytics)
3. Configure error tracking (Sentry, etc.)
4. Set up CI/CD for automatic deployments
5. Configure preview deployments for pull requests

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables
4. Test locally with production environment variables

---

**Deployment Status**: ✅ Ready for deployment
**Last Updated**: 2025-01-25

