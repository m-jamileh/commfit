-- Supabase Storage: job-photos bucket RLS policies
--
-- Run this in the Supabase SQL Editor after creating the bucket:
--   Dashboard → Storage → New bucket
--     Name: job-photos
--     Public: NO (private — code generates signed URLs at read time)
--
-- Then execute this file via Dashboard → SQL Editor.

-- Allow authenticated users to upload photos
create policy "auth_insert_job_photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'job-photos');

-- Allow authenticated users to read/generate signed URLs
create policy "auth_select_job_photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'job-photos');
