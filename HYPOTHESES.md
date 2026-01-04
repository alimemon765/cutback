# Review Link Loading Issue - Debug Hypotheses

## Hypotheses (in order of likelihood)

### Hypothesis A: createAPIClient fails due to missing auth cookies
**Prediction**: `createAPIClient(request)` finds no Supabase cookies, causing `supabase.auth.getUser()` to return null/error, which then causes RLS policies to fail because `auth.uid()` is NULL.

**Expected Log Evidence**:
- `[createAPIClient] No Supabase cookies found`
- `[Review Verify] Auth check: null` or `[Review Verify] Auth error: ...`
- RLS policy violation errors mentioning `auth.uid()` is NULL

### Hypothesis B: RLS policies block anonymous access to review_links
**Prediction**: Even if we query without auth, the RLS policy on `review_links` table doesn't allow `anon` role to SELECT, causing the query to fail silently or return empty.

**Expected Log Evidence**:
- `[Review Verify] Link query error: ...` with RLS policy violation
- Error message mentioning "row-level security policy"

### Hypothesis C: RLS policies block anonymous access to video_versions
**Prediction**: The `video_versions` table RLS policy doesn't allow `anon` role, causing the video query to fail even if review_links query succeeds.

**Expected Log Evidence**:
- `[Review Verify] Video version query error: ...` with RLS policy violation
- Error message about `video_versions` table

### Hypothesis D: Signed URL generation fails for anonymous users
**Prediction**: `supabase.storage.from('videos').createSignedUrl()` fails because storage RLS doesn't allow anonymous access, or the client doesn't have proper permissions.

**Expected Log Evidence**:
- `[Review Verify] Signed URL error: ...`
- Storage access denied errors

### Hypothesis E: Client-side fetch promise never resolves
**Prediction**: The API returns an error response, but the client-side error handling swallows it or the promise hangs indefinitely, causing infinite loading.

**Expected Log Evidence**:
- `[Review Page] Fetch response status: 401/403/500`
- `[Review Page] Fetch error: ...`
- No response received at all (timeout)



