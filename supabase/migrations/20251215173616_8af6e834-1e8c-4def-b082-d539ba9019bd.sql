-- Create strains/products table for the dispensary
CREATE TABLE public.strains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Hybrid',
  flavors TEXT[] DEFAULT '{}',
  helps_with TEXT[] DEFAULT '{}',
  feelings TEXT[] DEFAULT '{}',
  thc_content NUMERIC NOT NULL DEFAULT 0,
  cbd_content NUMERIC NOT NULL DEFAULT 0,
  cbg_content NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  client_url TEXT,
  brand_name TEXT DEFAULT 'Dr. Green',
  retail_price NUMERIC NOT NULL DEFAULT 0,
  availability BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER NOT NULL DEFAULT 100,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;

-- Public read access for strains (anyone can view products)
CREATE POLICY "Anyone can view strains"
ON public.strains
FOR SELECT
USING (is_archived = false);

-- Admin-only write access
CREATE POLICY "Admins can manage strains"
ON public.strains
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_strains_updated_at
BEFORE UPDATE ON public.strains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_strains_type ON public.strains(type);
CREATE INDEX idx_strains_availability ON public.strains(availability);
CREATE INDEX idx_strains_sku ON public.strains(sku);