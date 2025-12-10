-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  description TEXT,
  max_uses INTEGER CHECK (max_uses > 0),
  uses_count INTEGER DEFAULT 0 CHECK (uses_count >= 0),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  minimum_amount INTEGER CHECK (minimum_amount >= 0),
  applicable_products UUID[] DEFAULT '{}',
  applicable_categories TEXT[] DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX idx_discount_codes_expires_at ON discount_codes(expires_at);

-- Create function to increment discount usage
CREATE OR REPLACE FUNCTION increment_discount_usage(code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discount_codes 
  SET uses_count = uses_count + 1 
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies (if using Supabase)
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy for reading discount codes (everyone can read active codes)
CREATE POLICY "Anyone can view active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Policy for inserting discount codes (authenticated users only)
CREATE POLICY "Authenticated users can create discount codes" ON discount_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating discount codes (authenticated users only)
CREATE POLICY "Authenticated users can update discount codes" ON discount_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for deleting discount codes (authenticated users only)
CREATE POLICY "Authenticated users can delete discount codes" ON discount_codes
  FOR DELETE USING (auth.role() = 'authenticated');
