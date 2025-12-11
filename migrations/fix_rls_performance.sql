 -- Fix RLS performance issues by wrapping auth functions in subqueries

-- Products table policies
DROP POLICY IF EXISTS "Admin insert access" ON public.products;
DROP POLICY IF EXISTS "Admin update access" ON public.products;
DROP POLICY IF EXISTS "Admin delete access" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

CREATE POLICY "Public read access" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Admin insert access" ON public.products
FOR INSERT WITH CHECK (
  (select auth.uid()) IS NOT NULL AND 
  (select auth.jwt()->>'role') = 'admin'
);

CREATE POLICY "Admin update access" ON public.products
FOR UPDATE USING (
  (select auth.uid()) IS NOT NULL AND 
  (select auth.jwt()->>'role') = 'admin'
);

CREATE POLICY "Admin delete access" ON public.products
FOR DELETE USING (
  (select auth.uid()) IS NOT NULL AND 
  (select auth.jwt()->>'role') = 'admin'
);

-- Discount codes table policies
DROP POLICY IF EXISTS "Discount codes public access" ON public.discount_codes;

CREATE POLICY "Discount codes public access" ON public.discount_codes
FOR ALL USING (
  CASE 
    WHEN ((select auth.jwt()->>'role') = 'admin') THEN true
    WHEN (is_active = true AND (expires_at IS NULL OR expires_at > now())) THEN true
    ELSE false
  END
);

-- Storage objects policies
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select auth.jwt()->>'role') = 'admin'
);

CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select auth.jwt()->>'role') = 'admin'
);

CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  (select auth.uid()) IS NOT NULL AND
  (select auth.jwt()->>'role') = 'admin'
);
