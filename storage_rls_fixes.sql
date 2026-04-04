-- Run this in your Supabase SQL Editor to allow public uploads to the bucket!

-- Allow anyone to upload images to the bucket
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'ambassador_photos' );

-- Allow anyone to view images in the bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'ambassador_photos' );
