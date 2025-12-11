-- Fix security issue: Function Search Path Mutable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin';
$$ LANGUAGE sql STABLE SET search_path = '';
