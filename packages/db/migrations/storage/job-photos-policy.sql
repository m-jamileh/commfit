-- Supabase Storage: job-photos bucket + RLS policies
-- Path convention: <accountId>/<jobId>/<photoId>.<ext>
-- Apply via: Supabase Dashboard → SQL Editor (or supabase db push for local dev)
-- This script is idempotent — safe to re-run.

-- 1. Create the bucket (private; not public-read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. INSERT policy: authenticated users may upload only to their own account prefix
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'job-photos: insert own account'
  ) THEN
    CREATE POLICY "job-photos: insert own account"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'job-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'account_id')
      );
  END IF;
END $$;

-- 3. SELECT policy: authenticated users may read only from their own account prefix
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'job-photos: select own account'
  ) THEN
    CREATE POLICY "job-photos: select own account"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'job-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'account_id')
      );
  END IF;
END $$;

-- Notes:
-- * Service-role key bypasses RLS automatically — no policy needed for API/worker.
-- * The frontend tech app uploads directly using the anon/user JWT; the account_id
--   JWT claim must be present in the token (set via Supabase Auth hook or app_metadata).
-- * DELETE is intentionally omitted from M4.1 scope; add a separate policy if required.
