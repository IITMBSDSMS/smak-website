-- =========================================================================
-- SUPERBASE STORAGE BUCKET SETUP FOR SMAK
-- =========================================================================

-- 1. Create Profile Photos Bucket
insert into storage.buckets (id, name, public) 
values ('profile_photos', 'profile_photos', true)
on conflict do nothing;

create policy "Public Photo Upload" 
on storage.objects for insert 
with check ( bucket_id = 'profile_photos' );

create policy "Public Photo Read" 
on storage.objects for select 
using ( bucket_id = 'profile_photos' );

-- 2. Create Certificates Bucket
insert into storage.buckets (id, name, public) 
values ('certificates', 'certificates', true)
on conflict do nothing;

create policy "Public Cert Upload" 
on storage.objects for insert 
with check ( bucket_id = 'certificates' );

create policy "Public Cert Read" 
on storage.objects for select 
using ( bucket_id = 'certificates' );

-- 3. Invoices/Secure Assets (Private)
insert into storage.buckets (id, name, public) 
values ('invoices', 'invoices', false)
on conflict do nothing;

-- Add user-authenticated policies here if needed for invoices.
