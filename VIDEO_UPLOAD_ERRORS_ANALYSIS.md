# Video Upload Errors - Complete Analysis

## Error Timeline

### Error 1: 401 Unauthorized (Initial)
**Status**: ✅ FIXED
**Error Message**: `POST /api/projects/[id]/videos 401 (Unauthorized)`
**Root Cause**: The route was using `createAPIClient()` which couldn't read cookies properly from the request headers.

**Fix Applied**:
- Extracted access token directly from cookie header
- Created `createServerClient` with empty cookies
- Called `setSession()` with extracted tokens
- Used `userId` from cookie instead of calling `getUser()` (which returned null)

**Evidence from Logs**:
```
"Session set" with hasSession: true, hasUser: true
"No user after session set" - getUser() returned null
```

---

### Error 2: 500 Internal Server Error - Storage RLS Violation (Current)
**Status**: ❌ IN PROGRESS
**Error Message**: 
```
StorageApiError: new row violates row-level security policy
status: 400
statusCode: '403'
```

**Root Cause**: 
The Supabase Storage client (`supabase.storage.from('videos').upload()`) is not properly authenticated. Even though we set the session on the client, the storage service requires the JWT token to be passed in the request headers, and `setSession()` on a server client doesn't propagate to storage operations.

**Why This Happens**:
1. `createServerClient` with empty cookies doesn't maintain session state
2. `setSession()` sets the session for auth operations, but storage operations use a separate HTTP client
3. Storage RLS policies check `auth.uid()` which requires the JWT in the Authorization header
4. The storage client doesn't automatically use the session we set

**Storage RLS Policy**:
```sql
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');
```

This policy requires:
- User to be in `authenticated` role
- `auth.uid()` must return a valid user ID
- JWT token must be present in the request

---

## What We've Tried

### Attempt 1: Using `createAPIClient()` (Failed)
- **Why**: Cookie parsing didn't work in API routes
- **Result**: 401 Unauthorized

### Attempt 2: Extract Token + `setSession()` (Partially Fixed)
- **Why**: Got past auth, but storage still fails
- **Result**: 401 → 500 (Storage RLS violation)

### Current Implementation:
```typescript
// Extract token from cookie ✅
const cookieData = JSON.parse(decodedValue);
accessToken = cookieData.access_token;

// Create client with empty cookies
const supabase = createServerClient(..., { cookies: { getAll: () => [], setAll: () => {} } });

// Set session
await supabase.auth.setSession({ access_token, refresh_token });

// Try to upload (FAILS HERE)
await supabase.storage.from('videos').upload(filePath, videoFile);
```

---

## Why Storage Upload Fails

### The Problem:
1. **Storage uses separate HTTP client**: The storage client doesn't share session state with the auth client
2. **JWT not in headers**: When we call `upload()`, it doesn't include the `Authorization: Bearer <token>` header
3. **RLS checks `auth.uid()`**: Without the JWT, PostgreSQL can't determine the user, so `auth.uid()` returns NULL
4. **Policy fails**: The policy `TO authenticated` requires `auth.uid()` to be non-null

### Technical Details:
- Supabase Storage is a separate service from the database
- Storage operations go through `storage.supabase.co` (not `rest/v1`)
- Storage client needs explicit authentication headers
- `setSession()` only affects the auth client, not the storage client

---

## Solutions to Try

### Solution 1: Use Storage REST API Directly (Recommended)
**Approach**: Make direct HTTP requests to Supabase Storage API with Authorization header

**Pros**:
- Full control over headers
- Guaranteed JWT is sent
- Works with RLS policies
- Similar to our database REST API approach

**Cons**:
- More complex (need to handle multipart/form-data)
- Need to construct the request manually

**Implementation**:
```typescript
const formData = new FormData();
formData.append('file', videoFile);

const response = await fetch(
  `${supabaseUrl}/storage/v1/object/videos/${filePath}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // Don't set Content-Type - let browser set it with boundary
    },
    body: formData,
  }
);
```

---

### Solution 2: Use Client-Side Upload (Alternative)
**Approach**: Upload directly from the browser using `createBrowserClient`

**Pros**:
- Simpler implementation
- Browser handles cookies automatically
- Storage client works correctly

**Cons**:
- Less control over the upload process
- File goes through client → server → Supabase (extra hop)
- Harder to add server-side validation

**Implementation**:
```typescript
// In VideoUpload.tsx
const supabase = createBrowserClient(...);
await supabase.storage.from('videos').upload(filePath, file);
```

---

### Solution 3: Use Service Role Key (NOT RECOMMENDED)
**Approach**: Bypass RLS using service role key

**Pros**:
- Works immediately
- No RLS issues

**Cons**:
- **SECURITY RISK**: Bypasses all security
- Service role key should never be exposed
- Not suitable for user-facing operations

**Why We Won't Use This**:
- Violates security best practices
- Defeats the purpose of RLS
- Could allow unauthorized access

---

## Recommended Solution: Storage REST API

### Why This Is Best:
1. ✅ Consistent with our database approach
2. ✅ Guaranteed JWT is sent
3. ✅ Works with RLS policies
4. ✅ Server-side control
5. ✅ Secure

### Implementation Steps:
1. Extract access token (already done ✅)
2. Create FormData with file
3. Make POST request to Storage API endpoint
4. Include Authorization header with token
5. Handle response and errors

### Storage API Endpoint:
```
POST {SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{FILE_PATH}
Headers:
  Authorization: Bearer {access_token}
  apikey: {anon_key}
Body: multipart/form-data with file
```

---

## Next Steps

1. **Implement Storage REST API approach** in `app/api/projects/[id]/videos/route.ts`
2. **Test upload** with instrumentation
3. **Verify RLS policies** are working
4. **Clean up instrumentation** after confirmation

---

## Related Files

- `app/api/projects/[id]/videos/route.ts` - Video upload route (needs fix)
- `supabase/storage_policies.sql` - Storage RLS policies
- `components/projects/VideoUpload.tsx` - Client component (working)

---

## Summary

**Current Status**: Storage upload fails due to RLS policy violation
**Root Cause**: Storage client doesn't receive JWT token in request headers
**Solution**: Use Storage REST API with explicit Authorization header
**Priority**: High (blocks video upload feature)

