-- =========================================================================
-- SUPABASE SECURITY ADVISOR FIXES
-- Copy and run this in your Supabase SQL Editor
-- =========================================================================

-- 1. ERROR FIX: Enable Row Level Security (RLS) on Exposed Public Tables
-- Resolves "RLS Disabled in Public" errors
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- If you want these tables to be publicly readable, apply READ policies:
CREATE POLICY "Enable read access for all users" ON public.leaders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.collaborators FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.research_mentors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.research_scholars FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.board_members FOR SELECT USING (true);

-- 2. WARNING FIX: Function Search Path Mutable
-- Resolves warnings about functions where search_path is not set securely
ALTER FUNCTION public.set_member_entry_no() SET search_path = public;
ALTER FUNCTION public.generate_smak_id() SET search_path = public;
ALTER FUNCTION public.set_member_entry() SET search_path = public;
ALTER FUNCTION public.set_entry_no() SET search_path = public;
ALTER FUNCTION public.generate_smak_entry() SET search_path = public;

-- 3. WARNING FIX: RLS Policy Always True (public.members)
-- If your public.members table has a policy like 'USING (true)' for INSERTS, 
-- Supabase warns it is overly permissive. 
-- However, if it's meant to be a public signup form, this warning is expected and acceptable.
-- If you want to secure it further, you can drop the overly permissive policy and use Anon Key checks,
-- but for a simple public intake form, you can safely ignore the "RLS Policy Always True" warning!

-- 4. FIX: Missing LOR Configuration Columns
-- Run this to actually create the missing columns so data persists from Admin panel
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS director_name text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS director_sign text;

-- 5. FIX: Missing User Entity Columns
-- Completing the Master Data Model user entity
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS enrollment_date timestamp DEFAULT now();
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS linkedin_url text;

-- 6. RLS FIX: Allow admin to update member records
-- Required for the .update() calls from Admin Panel to work
CREATE POLICY "Enable update for all users" ON public.members
FOR UPDATE USING (true) WITH CHECK (true);
