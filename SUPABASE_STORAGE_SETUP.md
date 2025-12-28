# Supabase Storage Setup for Videos

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tuqodkaweecctmnitaxu
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `videos`
   - **Public bucket**: OFF (unchecked)
   - **File size limit**: 500 MB
   - **Allowed MIME types**: `video/mp4,video/webm,video/quicktime,video/x-msvideo`
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, go to **Storage** → **Policies** and add these policies:

### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');
```

**How to add:**
1. Click **New Policy** on the `storage.objects` table
2. Choose **For full customization**
3. Policy name: `Authenticated users can upload videos`
4. Allowed operation: `INSERT`
5. Target roles: `authenticated`
6. USING expression: (leave empty)
7. WITH CHECK expression: `bucket_id = 'videos'`

### Policy 2: Allow Authenticated Users to Read Own Videos

```sql
CREATE POLICY "Users can read own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');
```

**How to add:**
1. Click **New Policy**
2. Choose **For full customization**
3. Policy name: `Users can read own videos`
4. Allowed operation: `SELECT`
5. Target roles: `authenticated`
6. USING expression: `bucket_id = 'videos'`
7. WITH CHECK expression: (leave empty)

### Policy 3: Allow Public Read via Signed URLs

```sql
CREATE POLICY "Public can read videos via signed URL"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'videos');
```

**How to add:**
1. Click **New Policy**
2. Choose **For full customization**
3. Policy name: `Public can read videos via signed URL`
4. Allowed operation: `SELECT`
5. Target roles: `anon`
6. USING expression: `bucket_id = 'videos'`
7. WITH CHECK expression: (leave empty)

### Policy 4: Allow Users to Delete Own Videos

```sql
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');
```

**How to add:**
1. Click **New Policy**
2. Choose **For full customization**
3. Policy name: `Users can delete own videos`
4. Allowed operation: `DELETE`
5. Target roles: `authenticated`
6. USING expression: `bucket_id = 'videos'`
7. WITH CHECK expression: (leave empty)

## Step 3: Verify Setup

1. Go to **Storage** → **videos** bucket
2. Try uploading a test video file
3. Verify you can see the file
4. Delete the test file

## Storage Structure

Videos will be stored with this path structure:
```
videos/
  └── {project_id}/
      ├── v1_{filename}.mp4
      ├── v2_{filename}.mp4
      └── v3_{filename}.mp4
```

## Notes

- The bucket is **private** by default
- Videos are accessed via **signed URLs** (temporary, secure links)
- Signed URLs expire after a set time (default: 1 hour)
- For reviewers, we'll generate long-lived signed URLs (7 days)
- Maximum file size: 500 MB per video
- Supported formats: MP4, WebM, QuickTime, AVI

## Troubleshooting

If uploads fail:
1. Check bucket exists and is named exactly `videos`
2. Verify all 4 policies are created
3. Check file size is under 500 MB
4. Verify file is a video format
5. Check browser console for errors

