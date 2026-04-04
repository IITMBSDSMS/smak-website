-- =========================================================================
-- CAMPUS AMBASSADOR PIPELINE SCHEMA
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. Create the Table
create table public.campus_ambassadors (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null unique,
  phone text not null,
  college_name text not null,
  city_state text not null,
  year_of_study text not null,
  reason text not null,
  experience text,
  linkedin text,
  instagram text,
  photo_url text not null,
  status text default 'applied' not null, -- applied, shortlisted, interview, selected, rejected
  utm_source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.campus_ambassadors enable row level security;

-- 3. Allow public inserts (so anyone can apply without being logged in)
create policy "Allow public inserts" 
on public.campus_ambassadors 
for insert 
with check (true);

-- 4. Allow select/update for admins (or anyone for now if developing locally. 
-- In production, restrict this to authenticated admins)
create policy "Allow all operations for now" 
on public.campus_ambassadors 
for all 
using (true);

-- =========================================================================
-- STORAGE BUCKET SETUP
-- =========================================================================

-- 1. Create the bucket for photos
insert into storage.buckets (id, name, public) 
values ('ambassador_photos', 'ambassador_photos', true);

-- 2. Allow public uploads to this bucket
create policy "Public Upload" 
on storage.objects for insert 
with check ( bucket_id = 'ambassador_photos' );

-- 3. Allow public reads
create policy "Public Read" 
on storage.objects for select 
using ( bucket_id = 'ambassador_photos' );

-- =========================================================================
-- LMS & CRM PIPELINE SCHEMA (Users, Courses, Enrollments, etc)
-- =========================================================================

-- 1. Users (Mentees)
create table public.users_mentee (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null unique,
  phone text not null,
  college_name text not null,
  year_of_study text not null,
  course_enrolled text,
  enrollment_date timestamp with time zone default timezone('utc'::text, now()),
  status text default 'active', -- active, completed, dropped
  photo_url text,
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Courses
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  duration text not null,
  modules jsonb default '[]'::jsonb,
  attendance_req_percent numeric default 70,
  quiz_weightage_percent numeric default 50,
  lor_attendance_req numeric default 85,
  lor_quiz_req numeric default 75,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enrollments
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_mentee(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  payment_status text default 'pending', -- pending, success, failed
  invoice_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Attendance
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_mentee(id) on delete cascade not null,
  session_id text not null,
  zoom_status text, 
  duration_attended numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Assessments
create table public.assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_mentee(id) on delete cascade not null,
  quiz_id text not null,
  score numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Certificates
create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_mentee(id) on delete cascade not null,
  generated_status text default 'pending',
  certificate_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. LOR (Letter of Recommendation)
create table public.lors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_mentee(id) on delete cascade not null,
  eligibility_status text default 'pending',
  generated_file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Enable
alter table public.users_mentee enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.assessments enable row level security;
alter table public.certificates enable row level security;
alter table public.lors enable row level security;

-- Policies for public testing (for now)
create policy "Allow all users_mentee" on public.users_mentee for all using (true);
create policy "Allow all courses" on public.courses for all using (true);
create policy "Allow all enrollments" on public.enrollments for all using (true);
create policy "Allow all attendance" on public.attendance for all using (true);
create policy "Allow all assessments" on public.assessments for all using (true);
create policy "Allow all certificates" on public.certificates for all using (true);
create policy "Allow all lors" on public.lors for all using (true);

-- Adding Storage Buckets for Documents
insert into storage.buckets (id, name, public) values 
  ('user_photos', 'user_photos', true),
  ('invoices', 'invoices', true),
  ('certificates', 'certificates', true),
  ('lors', 'lors', true);

-- Allowing public storage ops for newly added buckets
create policy "Public Ops Photos" on storage.objects for all using (bucket_id = 'user_photos');
create policy "Public Ops Invoices" on storage.objects for all using (bucket_id = 'invoices');
create policy "Public Ops Certs" on storage.objects for all using (bucket_id = 'certificates');
create policy "Public Ops Lors" on storage.objects for all using (bucket_id = 'lors');
