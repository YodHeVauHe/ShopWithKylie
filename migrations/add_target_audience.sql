-- Add target_audience column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'Unisex';
