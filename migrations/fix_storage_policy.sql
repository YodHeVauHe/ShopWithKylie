-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Create new policies allowing any authenticated user to manage product images
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated update access" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated delete access" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');
