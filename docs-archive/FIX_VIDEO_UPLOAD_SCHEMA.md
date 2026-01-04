# Fix Video Upload Schema Mismatch

## Error
```
Could not find the 'file_path' column of 'video_versions' in the schema cache
```

## Root Cause
The `video_versions` table is missing columns that the code expects:
- `file_path` (code expects this, but table only has `file_url`)
- `mime_type` (code expects this, but table doesn't have it)
- `storage_url` (code expects this, but table doesn't have it)
- `uploaded_by` (code expects this, but table doesn't have it)

## Solution: Run Migration

### Step 1: Run the Migration SQL

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/tuqodkaweecctmnitaxu
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migration_add_video_columns.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify Columns Were Added

Run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'video_versions'
ORDER BY ordinal_position;
```

You should see:
- ✅ `file_path` (TEXT)
- ✅ `mime_type` (TEXT)
- ✅ `storage_url` (TEXT)
- ✅ `uploaded_by` (UUID)

### Step 3: Test Upload Again

After running the migration, try uploading a video again. It should work now!

---

## Alternative: Quick Fix (Use Existing Schema)

If you can't run migrations right now, I can update the code to use the existing `file_url` column instead. Let me know if you want this temporary fix.

---

## What the Migration Does

1. Adds `file_path` column (migrates data from `file_url`)
2. Adds `mime_type` column
3. Adds `storage_url` column (migrates data from `file_url`)
4. Adds `uploaded_by` column (references auth.users)

All columns are added safely with `IF NOT EXISTS` checks, so it's safe to run multiple times.

