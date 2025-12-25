# CutBack Setup Guide

Follow these steps to get your development environment fully configured.

## Step 1: Set Up Supabase (Database, Auth, Storage)

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (or log in if you already have one)
3. Click "New Project"

### 1.2 Create a New Project
1. Enter project details:
   - **Name**: `cutback` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to you
2. Click "Create new project"
3. Wait 2-3 minutes for the project to be provisioned

### 1.3 Get Your API Keys
1. Once your project is ready, go to **Settings** (gear icon) → **API**
2. You'll need these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")
   - **service_role key** (under "Project API keys" → "service_role" - keep this secret!)

### 1.4 Enable Storage
1. Go to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Name it: `videos`
4. Make it **Private** (uncheck "Public bucket")
5. Click "Create bucket"

---

## Step 2: Set Up Resend (Email Service)

### 2.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2.2 Get API Key
1. Go to **API Keys** in the dashboard
2. Click "Create API Key"
3. Name it: `CutBack Development`
4. Give it "Sending access" permission
5. Copy the API key (starts with `re_...`)

### 2.3 Verify Domain (Optional for now)
- For development, you can use Resend's test domain
- For production, you'll need to verify your own domain later

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` File
1. In your project root, create a file named `.env.local`
2. Copy the contents from `.env.example`

### 3.2 Fill in Your Values
Open `.env.local` and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics (leave empty for now)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

**Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret

---

## Step 4: Test Your Setup

### 4.1 Start Development Server
```bash
npm run dev
```

### 4.2 Verify It Works
1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the CutBack homepage
3. Check the terminal for any errors

### 4.3 Test Supabase Connection (Optional)
We'll set up database tables next, but you can verify your connection works by checking the browser console for any Supabase-related errors.

---

## Step 5: What's Next?

Once you've completed the above steps, let me know and I'll help you with:

1. **Database Schema Setup** - Create all the necessary tables (users, projects, videos, comments, etc.)
2. **Authentication Pages** - Build login/signup pages
3. **Project Management** - Create the core project features

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Make sure you ran `npm install` and all dependencies are installed.

### Issue: Supabase connection errors
**Solution**: 
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes around the values
- Restart your dev server after changing `.env.local`

### Issue: Port 3000 already in use
**Solution**: 
- Kill the process using port 3000, or
- Run `npm run dev -- -p 3001` to use a different port

---

## Quick Checklist

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase API keys copied
- [ ] Storage bucket created
- [ ] Resend account created
- [ ] Resend API key copied
- [ ] `.env.local` file created with all values
- [ ] Development server runs without errors
- [ ] Homepage loads at localhost:3000

Once you've checked all these boxes, you're ready for the next phase! 🚀

