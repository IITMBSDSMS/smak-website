-- Run this in your Supabase SQL Editor to allow admins to delete members!

-- Enable Row Level Security (if not already enabled)
alter table public.members enable row level security;

-- Add a policy that allows anyone (for now) to delete a member. 
-- For production, this should ideally be restricted to authenticated admins, 
-- but this matches your current development policy.
create policy "Allow all deletes" 
on public.members 
for delete 
using (true);
