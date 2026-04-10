-- =========================================================================
-- SMAK EVENTS SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. Add new columns to existing events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 100;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category text DEFAULT 'Workshop';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_deadline text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tags text[];

-- 2. Create events_enrollments table
CREATE TABLE IF NOT EXISTS public.events_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  college text,
  payment_id text,
  order_id text,
  razorpay_signature text,
  amount numeric NOT NULL DEFAULT 0,
  payment_status text DEFAULT 'pending',  -- pending | success | failed | free
  enrolled_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.events_enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Allow anyone to insert (public enrollment)
DROP POLICY IF EXISTS "Allow public enrollment inserts" ON public.events_enrollments;
CREATE POLICY "Allow public enrollment inserts"
  ON public.events_enrollments
  FOR INSERT
  WITH CHECK (true);

-- 5. Allow all operations for admin panel
DROP POLICY IF EXISTS "Allow all enrollments for admin" ON public.events_enrollments;
CREATE POLICY "Allow all enrollments for admin"
  ON public.events_enrollments
  FOR ALL
  USING (true);

-- 6. Allow public to select their own enrollments (for duplicate check)
DROP POLICY IF EXISTS "Allow select enrollments" ON public.events_enrollments;
CREATE POLICY "Allow select enrollments"
  ON public.events_enrollments
  FOR SELECT
  USING (true);

-- 7. Create events storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
  VALUES ('events', 'events', true)
  ON CONFLICT (id) DO NOTHING;

-- 8. Allow public read and upload on events bucket
DROP POLICY IF EXISTS "Public events read" ON storage.objects;
CREATE POLICY "Public events read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Public events upload" ON storage.objects;
CREATE POLICY "Public events upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'events');

-- =========================================================================
-- DONE — Run this, then deploy the code changes
-- =========================================================================
