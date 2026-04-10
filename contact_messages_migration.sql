-- Run this in Supabase SQL Editor to add the contact_messages table

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT 'General Inquiry',
  message text NOT NULL,
  status text DEFAULT 'unread',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public contact inserts" ON public.contact_messages;
CREATE POLICY "Allow public contact inserts"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin all on contact_messages" ON public.contact_messages;
CREATE POLICY "Allow admin all on contact_messages"
  ON public.contact_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);
