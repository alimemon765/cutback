# Storage Size Limit Error - Fix Guide

## Error Summary

**Error**: `The object exceeded the maximum allowed size` (400 Bad Request)
**Status**: ✅ Authentication working (no more 401/403 errors)
**Issue**: Supabase Storage bucket has a file size limit that's smaller than the file being uploaded

---

## Root Cause

The Supabase Storage bucket has a **file size limit** configured that's smaller than:
1. The file you're trying to upload, OR
2. The 500MB limit we set in code

**Common Supabase Storage Limits:**
- **Free tier**: Often 50MB per file (default)
- **Pro tier**: Can be configured up to 5GB
- **Bucket-specific**: Each bucket can have its own limit

---

## Solution: Check and Update Bucket File Size Limit

### Step 1: Check Current Bucket Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tuqodkaweecctmnitaxu
2. Navigate to **Storage** in the left sidebar
3. Click on the **videos** bucket
4. Click **Settings** (gear icon)
5. Check the **File size limit** field

**What to look for:**
- If it says `50 MB` or `100 MB` → This is too small
- If it says `500 MB` → Should work, but verify the actual file size

### Step 2: Update Bucket File Size Limit

1. In the bucket settings, find **File size limit**
2. Change it to **500 MB** (or higher if needed)
3. Click **Save**

**Note**: If you're on the free tier, you might be limited to 50MB. You'll need to either:
- Upgrade to Pro tier, OR
- Compress your videos before upload, OR
- Use a smaller test file

### Step 3: Verify File Size

Check the actual file size of the video you're trying to upload:
- In Windows: Right-click file → Properties → Check "Size"
- In browser: The upload modal should show file size

**If file is > 500MB:**
- Compress the video
- Use a smaller test file
- Or increase the bucket limit (if on Pro tier)

---

## Alternative: Update Code to Match Bucket Limit

If you can't change the bucket limit, update the code to match:

### Option 1: Reduce MAX_FILE_SIZE

```typescript
// In app/api/projects/[id]/videos/route.ts
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (free tier default)
```

### Option 2: Make it Configurable

```typescript
// In app/api/projects/[id]/videos/route.ts
const MAX_FILE_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || '500000000'); // Default 500MB
```

Then add to `.env.local`:
```
MAX_VIDEO_SIZE=50000000  # 50MB
```

---

## Testing Steps

1. **Check bucket limit** in Supabase Dashboard
2. **Update limit** to 500MB (if possible)
3. **Try uploading a small test file** (< 10MB) to verify upload works
4. **Try uploading your actual file** and check the error message
5. **Check terminal logs** for file size information

---

## Expected Behavior After Fix

✅ Small files (< bucket limit) upload successfully
✅ Large files (> bucket limit) show clear error with file size
✅ Error message shows: "File size limit exceeded. Your file is X MB. Maximum allowed: Y MB."

---

## Debugging

The code now logs:
- File size in bytes
- File size in MB
- Maximum allowed size
- Whether file exceeds limit

Check terminal logs for:
```
[File size validation] fileSize: 123456789, fileSizeMB: "117.73", maxSizeMB: "500"
[Storage upload failed] fileSize: 123456789, fileSizeMB: "117.73"
```

---

## Common Issues

### Issue 1: Free Tier Limit
**Symptom**: Bucket limit is 50MB, can't change it
**Solution**: 
- Upgrade to Pro tier, OR
- Compress videos before upload, OR
- Use smaller test files

### Issue 2: File Size Mismatch
**Symptom**: Code says 500MB, but bucket is 50MB
**Solution**: Update bucket limit OR update code to match bucket

### Issue 3: File Actually Too Large
**Symptom**: File is 600MB, trying to upload to 500MB bucket
**Solution**: Compress video or increase bucket limit

---

## Next Steps

1. ✅ Check Supabase bucket file size limit
2. ✅ Update limit to 500MB (if possible)
3. ✅ Test with a small file first
4. ✅ Test with your actual file
5. ✅ Check logs for file size information

---

## Summary

**The upload is working correctly** - authentication is fixed! The issue is just a file size limit configuration. Update the bucket limit in Supabase Dashboard, and uploads should work.

