/*
  # Create Storage Bucket for Business Assets

  This migration creates a public storage bucket for business logos and assets.
  The bucket is configured to allow authenticated users to upload files.
  
  NOTE: If this fails, you may need to create the bucket manually in Supabase Dashboard:
  1. Go to Storage in Supabase Dashboard
  2. Click "New bucket"
  3. Name: business-assets
  4. Public bucket: Yes
  5. File size limit: 5MB
  6. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/svg+xml
*/

-- Create storage bucket for business assets (if storage.buckets table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'business-assets',
      'business-assets',
      true,
      5242880, -- 5MB in bytes
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload business assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own business assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'business-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own business assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public to view files (for logos on booking pages)
CREATE POLICY "Public can view business assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-assets');

-- Policy: Allow authenticated users to view all files in business-assets
CREATE POLICY "Authenticated users can view business assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'business-assets');

