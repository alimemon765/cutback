# Signup Redirect Debug Guide

## Expected Flow After Signup

### If Email Confirmation is DISABLED:
1. User fills signup form → Clicks "Create account"
2. ✅ Account created → Session created immediately
3. ✅ Redirects to `/dashboard`
4. ✅ Dashboard loads and shows user's projects

### If Email Confirmation is ENABLED:
1. User fills signup form → Clicks "Create account"
2. ✅ Account created → **NO session** (email confirmation required)
3. 📧 Shows "Check your email" message
4. User clicks confirmation link in email
5. ✅ Redirects to `/auth/callback` → Then to `/dashboard`

---

## Console Logs to Watch For

### During Signup:
```
🚀 [SIGNUP] Form submitted
📧 [SIGNUP] Creating Supabase client...
📝 [SIGNUP] Calling signUp with: { email, hasPassword: true, fullName }
📦 [SIGNUP] Response received: { hasUser: true, hasSession: true/false, ... }
```

### If Session Created (Email Confirmation Disabled):
```
✅ [SIGNUP] Signup successful! Session created.
👤 [SIGNUP] User ID: [uuid]
🔑 [SIGNUP] Session expires at: [timestamp]
🔄 [SIGNUP] Waiting for cookies to be set...
🚀 [SIGNUP] Redirecting to /dashboard...
```

### If Email Confirmation Required:
```
📧 [SIGNUP] Email confirmation required - user created but no session
👤 [SIGNUP] User ID: [uuid]
📧 [SIGNUP] User email: [email]
```

### In Middleware:
```
🛡️ [MIDDLEWARE] Processing request: /dashboard
👤 [MIDDLEWARE] Auth check: { hasUser: true/false, userId: ..., ... }
✅ [MIDDLEWARE] Request allowed, continuing...
```

### In Dashboard:
```
🏠 [DASHBOARD] Page loading...
👤 [DASHBOARD] User check: { hasUser: true, userId: ..., ... }
✅ [DASHBOARD] User authenticated, loading data...
📊 [DASHBOARD] Fetching user profile...
👤 [DASHBOARD] Profile: { hasProfile: true, profileName: ..., ... }
📁 [DASHBOARD] Fetching projects...
📁 [DASHBOARD] Projects: { count: 0, ... }
✅ [DASHBOARD] All data loaded, rendering page
```

---

## Troubleshooting

### Issue: Signup works but no redirect

**Check Console:**
1. Look for `✅ [SIGNUP] Signup successful!` - means session was created
2. Look for `🚀 [SIGNUP] Redirecting to /dashboard...` - means redirect was attempted
3. Check if `window.location.href` is being called

**Possible Causes:**
- Browser blocking redirect
- JavaScript error preventing redirect
- Network issue

**Solution:**
- Check browser console for errors
- Try manually going to `/dashboard` after signup
- Check if cookies are being set (Application tab → Cookies)

### Issue: Redirects to dashboard but shows login page

**Check Console:**
1. Look for `🛡️ [MIDDLEWARE] Processing request: /dashboard`
2. Check `👤 [MIDDLEWARE] Auth check: { hasUser: false, ... }` - means no user found
3. This means cookies weren't set properly

**Possible Causes:**
- Cookies not being set by Supabase
- Cookie domain/path issues
- Browser blocking cookies

**Solution:**
- Check Application tab → Cookies in browser dev tools
- Look for `sb-` prefixed cookies
- Ensure cookies are being set for the correct domain

### Issue: Shows "Check your email" message

**This is Normal if:**
- Email confirmation is enabled in Supabase
- User needs to click confirmation link first

**Solution:**
- Disable email confirmation in Supabase (for development)
- OR check email and click confirmation link

---

## What to Check

1. **Browser Console (F12 → Console)**
   - Look for all the emoji-prefixed logs
   - Check for any red error messages

2. **Network Tab (F12 → Network)**
   - Check if `/dashboard` request is made
   - Check response status (should be 200)
   - Check if auth cookies are being sent

3. **Application Tab (F12 → Application → Cookies)**
   - Look for cookies starting with `sb-`
   - Check if they're set for your domain
   - Check expiration dates

4. **Supabase Dashboard**
   - Go to Authentication → Users
   - Check if user was created
   - Check if email is confirmed (if confirmation is enabled)

---

## Quick Test

1. Open browser console (F12)
2. Go to signup page
3. Fill form and submit
4. Watch console logs
5. Share the logs if something doesn't work

The logs will tell us exactly where the process is failing!


