-- Fix Discount Codes Performance Issue (Multiple Permissive Policies)
-- Change "Public read active codes" to apply only to 'anon' role, not 'public'
-- This prevents authenticated users from evaluating two policies for SELECT

DROP POLICY IF EXISTS "Public read active codes" ON public.discount_codes;

CREATE POLICY "Public read active codes" ON public.discount_codes
FOR SELECT TO anon
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > now())
);
