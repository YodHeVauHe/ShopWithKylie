-- Create helper function for admin check to ensure stable evaluation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin';
$$ LANGUAGE sql STABLE;

-- Products table policies
DROP POLICY IF EXISTS "Admin insert access" ON public.products;
DROP POLICY IF EXISTS "Admin update access" ON public.products;
DROP POLICY IF EXISTS "Admin delete access" ON public.products;

CREATE POLICY "Admin insert access" ON public.products
FOR INSERT WITH CHECK (
  (select auth.uid()) IS NOT NULL AND 
  (select public.is_admin())
);

CREATE POLICY "Admin update access" ON public.products
FOR UPDATE USING (
  (select auth.uid()) IS NOT NULL AND 
  (select public.is_admin())
);

CREATE POLICY "Admin delete access" ON public.products
FOR DELETE USING (
  (select auth.uid()) IS NOT NULL AND 
  (select public.is_admin())
);

-- Discount codes table policies
DROP POLICY IF EXISTS "Discount codes public access" ON public.discount_codes;

CREATE POLICY "Discount codes public access" ON public.discount_codes
FOR ALL USING (
  CASE 
    WHEN ((select public.is_admin())) THEN true
    WHEN (is_active = true AND (expires_at IS NULL OR expires_at > now())) THEN true
    ELSE false
  END
);

-- Storage objects policies
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select public.is_admin())
);

CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select public.is_admin())
);

CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select public.is_admin())
);
