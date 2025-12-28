# 🔍 Debug Testing Guide - API Authentication Fix

## ✅ What Was Implemented

### 1. Debug Endpoint Created
- **File:** `app/api/debug-cookies/route.ts`
- **Purpose:** Check if cookies are being sent to the server
- **URL:** `/api/debug-cookies`

### 2. Enhanced Login Form Logging
- **File:** `components/auth/LoginForm.tsx`
- **Added:** Detailed cookie checking after login
- **Logs:** Session info, cookie presence, Supabase cookie detection

### 3. Updated Middleware
- **File:** `middleware.ts`
- **Changes:** 
  - Ensures cookies are set with proper attributes (`sameSite: 'lax'`)
  - Sets `httpOnly: false` to allow client-side access
  - Properly handles cookie setting in response

### 4. Enhanced API Route Logging
- **File:** `app/api/projects/route.ts`
- **Added:** Comprehensive debug logging for:
  - Cookie header presence and content
  - Cookie parsing
  - Authentication results
  - User information
  - Error details

---

## 🧪 Step-by-Step Testing Protocol

### Step 1: Clear All Cookies

**In Browser Console (F12 → Console):**
```javascript
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=" + new Date(0).toUTCString();
});
console.log("Cookies cleared");
```

**OR manually:**
- F12 → Application → Cookies → Right-click → Clear all

---

### Step 2: Test Login Flow

1. **Go to `/login`**
2. **Open Browser Console (F12)**
3. **Login with your credentials**
4. **Watch for these console logs:**

```
✅ [LOGIN FORM] Login successful!
🔐 [LOGIN FORM] Session: { hasSession: true, hasUser: true, ... }
🍪 [LOGIN FORM] All cookies: sb-xxx-auth-token=...
🍪 [LOGIN FORM] Has Supabase cookie: true
🍪 [LOGIN FORM] Supabase cookies found: 1
🍪 [LOGIN FORM] Cookie: sb-tuqodkaweecctmnitaxu-auth-token
```

**✅ Expected:** Should see Supabase cookies in console

**❌ If not:** Cookies aren't being set by Supabase client

---

### Step 3: Check Browser Cookies

1. **F12 → Application → Cookies → `http://localhost:3001`** (or your port)
2. **Look for:**
   - `sb-tuqodkaweecctmnitaxu-auth-token` (or similar)
   - Cookie should have:
     - **Name:** `sb-{project-ref}-auth-token`
     - **Value:** Long JSON string
     - **Domain:** `localhost` (or your domain)
     - **Path:** `/`
     - **SameSite:** `Lax`
     - **HttpOnly:** `false` (or unchecked)

**✅ Expected:** Cookie exists with proper attributes

**❌ If not:** Check middleware or Supabase client configuration

---

### Step 4: Test Debug Endpoint

1. **After logging in, visit:** `http://localhost:3001/api/debug-cookies`
2. **Check the JSON response:**

```json
{
  "hasCookie": true,
  "cookieHeader": "sb-xxx-auth-token=...",
  "cookieLength": 1234,
  "allCookies": ["sb-xxx-auth-token", ...],
  "supabaseCookies": [
    {
      "name": "sb-tuqodkaweecctmnitaxu-auth-token",
      "valueLength": 1234,
      "preview": "..."
    }
  ],
  "cookieCount": 1,
  "sbCookieCount": 1
}
```

**✅ Expected:** `hasCookie: true`, `sbCookieCount: 1`

**❌ If not:** Cookies aren't being sent with requests

---

### Step 5: Test Project Creation

1. **Go to Dashboard** (`/dashboard`)
2. **Open Browser Console (F12)**
3. **Open Terminal** (where `npm run dev` is running)
4. **Click "Create Project" or "New Project"**
5. **Fill in project name**
6. **Submit**

**Watch Terminal for:**
```
=== [Projects POST] Request Debug ===
[Projects POST] Has cookie header: true
[Projects POST] Cookie header length: 1234
[Projects POST] Cookie preview: sb-tuqodkaweecctmnitaxu-auth-token=...
[Projects POST] Cookie names: ['sb-tuqodkaweecctmnitaxu-auth-token', ...]
[Projects POST] Supabase cookies: ['sb-tuqodkaweecctmnitaxu-auth-token']
[Projects POST] Auth result: { hasUser: true, userId: '...', userEmail: '...' }
[Projects POST] User authenticated: your@email.com
[Projects POST] Project created successfully: xxx-xxx-xxx
=== [Projects POST] End Debug ===
```

**✅ Expected:** All logs show success, project is created

**❌ If you see:**
- `Has cookie header: false` → Cookies not being sent
- `Auth result: { hasUser: false }` → Cookie parsing failed
- `Auth error: Auth session missing!` → Cookie format issue

---

## 🔧 Troubleshooting Based on Results

### Issue 1: No Cookies After Login

**Symptoms:**
- Console shows: `Has Supabase cookie: false`
- No cookies in Application tab

**Fix:**
1. Check `lib/supabase/client.ts` - should be simple `createBrowserClient()` call
2. Verify environment variables are set
3. Check browser console for Supabase errors

---

### Issue 2: Cookies Exist But Not Sent to API

**Symptoms:**
- Cookies visible in Application tab
- `/api/debug-cookies` shows `hasCookie: false`

**Fix:**
1. Ensure `credentials: 'include'` in fetch requests (already done in `CreateProjectModal.tsx`)
2. Check CORS settings
3. Verify cookie domain matches your app domain

---

### Issue 3: Cookies Sent But Auth Fails

**Symptoms:**
- `/api/debug-cookies` shows cookies
- Terminal shows: `Auth error: Auth session missing!`

**Fix:**
1. Check cookie value format in terminal logs
2. Verify cookie parsing in `lib/supabase/api.ts`
3. Try clearing cookies and logging in again

---

### Issue 4: Cookie Format Mismatch

**Symptoms:**
- Cookies exist and are sent
- But `createServerClient` can't parse them

**Fix:**
1. Check the actual cookie value in terminal
2. Verify it's valid JSON (URL-decoded)
3. Check if cookie is being URL-encoded twice

---

## 📊 Expected Terminal Output (Success)

```
=== [Projects POST] Request Debug ===
[Projects POST] Has cookie header: true
[Projects POST] Cookie header length: 1234
[Projects POST] Cookie preview: sb-tuqodkaweecctmnitaxu-auth-token=%7B%22access_token%22%3A...
[Projects POST] Cookie names: ['sb-tuqodkaweecctmnitaxu-auth-token']
[Projects POST] Supabase cookies: ['sb-tuqodkaweecctmnitaxu-auth-token']
[Projects POST] Auth result: {
  hasUser: true,
  userId: 'bdaf2bc0-38d6-4982-b8da-0967135f5889',
  userEmail: 'ali.memon1507@gmail.com',
  errorMessage: undefined,
  errorCode: undefined
}
[Projects POST] User authenticated: ali.memon1507@gmail.com
[Projects POST] Project created successfully: xxx-xxx-xxx
=== [Projects POST] End Debug ===
```

---

## 🎯 Next Steps After Testing

1. **Run all 5 test steps above**
2. **Copy terminal output** when creating a project
3. **Copy browser console output** from login
4. **Share results** so we can identify the exact issue

---

## 📝 Quick Test Commands

**Test cookie endpoint:**
```bash
# In browser, after login:
fetch('/api/debug-cookies').then(r => r.json()).then(console.log)
```

**Test project creation:**
```bash
# In browser console, after login:
fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test Project' }),
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

**Status:** ✅ All debug tools implemented - Ready for testing!

