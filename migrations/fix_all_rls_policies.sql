-- Fix Products Table Policies
DROP POLICY IF EXISTS "Admin insert access" ON public.products;
DROP POLICY IF EXISTS "Admin update access" ON public.products;
DROP POLICY IF EXISTS "Admin delete access" ON public.products;

CREATE POLICY "Authenticated insert access" ON public.products
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated update access" ON public.products
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated delete access" ON public.products
FOR DELETE TO authenticated
USING (true);

-- Fix Discount Codes Table Policies
DROP POLICY IF EXISTS "Discount codes public access" ON public.discount_codes;

-- Allow public to read active, unexpired codes (for validation)
CREATE POLICY "Public read active codes" ON public.discount_codes
FOR SELECT TO public
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > now())
);

-- Allow authenticated users to do everything
CREATE POLICY "Authenticated full access" ON public.discount_codes
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
