-- 1. Identify and delete duplicate emails keeping only the first one inserted (to prevent constraint failure)
-- Warning: If you have data you care about, manually review duplicates first!

-- 2. Add the UNIQUE constraint to the 'email' column securely
ALTER TABLE public.members ADD CONSTRAINT members_email_key UNIQUE (email);
