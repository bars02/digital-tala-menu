-- =====================================================================
-- Supabase Schema for Tala Restaurant & Café Menu
-- Paste this script into the Supabase SQL Editor to set up your database.
-- =====================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    title_ku TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Create Dishes Table
CREATE TABLE IF NOT EXISTS public.dishes (
    id TEXT PRIMARY KEY,
    category TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    price BIGINT NOT NULL,
    image TEXT,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ku TEXT,
    description TEXT,
    description_en TEXT,
    description_ku TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Dishes
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allowing public read/write access via the Anon Key for simplicity.
-- =====================================================================

-- Policies for Categories
CREATE POLICY "Allow public read categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert categories" 
ON public.categories FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update categories" 
ON public.categories FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete categories" 
ON public.categories FOR DELETE 
USING (true);

-- Policies for Dishes
CREATE POLICY "Allow public read dishes" 
ON public.dishes FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert dishes" 
ON public.dishes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update dishes" 
ON public.dishes FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete dishes" 
ON public.dishes FOR DELETE 
USING (true);

-- =====================================================================
-- STORAGE BUCKET CONFIGURATION
-- Configures the 'menu-images' bucket for uploading product photos.
-- Note: Make sure to create a bucket named 'menu-images' in the 
-- Supabase Storage UI and set its access level to PUBLIC.
-- Alternatively, the SQL below sets up the bucket and policies.
-- =====================================================================

-- Insert bucket config
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (menu-images)
CREATE POLICY "Allow public read from menu-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "Allow public upload to menu-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Allow public update to menu-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "Allow public delete from menu-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'menu-images');

-- =====================================================================
-- 3. Create Excellence Items Table (Promo Modal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.excellence_items (
    id TEXT PRIMARY KEY,
    price BIGINT NOT NULL,
    image TEXT,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ku TEXT,
    description TEXT,
    description_en TEXT,
    description_ku TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Excellence Items
ALTER TABLE public.excellence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read excellence_items" 
ON public.excellence_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert excellence_items" 
ON public.excellence_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update excellence_items" 
ON public.excellence_items FOR UPDATE USING (true);

CREATE POLICY "Allow public delete excellence_items" 
ON public.excellence_items FOR DELETE USING (true);
