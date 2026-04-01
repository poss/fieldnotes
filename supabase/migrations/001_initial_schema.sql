-- FieldNotes: Initial Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Anyone can read profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- SOUND POSTS
-- ============================================================

create table sound_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  note text,
  audio_path text not null,
  duration_seconds real not null,

  -- Private: exact capture coordinates, never exposed publicly
  capture_latitude double precision not null,
  capture_longitude double precision not null,

  -- Public: generalized area (H3 hex cell)
  public_area_index text not null,
  public_area_label text,
  public_latitude double precision not null,
  public_longitude double precision not null,

  location_source text not null default 'device'
    check (location_source in ('device', 'manual')),
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'active'
    check (status in ('active', 'hidden', 'pending', 'removed')),
  is_public boolean not null default true
);

alter table sound_posts enable row level security;

-- Anyone can read active, public sound posts
create policy "Public sounds are viewable by everyone"
  on sound_posts for select
  using (status = 'active' and is_public = true);

-- Users can read all their own posts (any status)
create policy "Users can view their own sounds"
  on sound_posts for select
  using (auth.uid() = user_id);

-- Users can insert their own posts
create policy "Users can create sounds"
  on sound_posts for insert
  with check (auth.uid() = user_id);

-- Users can update their own posts
create policy "Users can update their own sounds"
  on sound_posts for update
  using (auth.uid() = user_id);

-- Users can delete their own posts
create policy "Users can delete their own sounds"
  on sound_posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- SOUND REPORTS
-- ============================================================

create table sound_reports (
  id uuid primary key default gen_random_uuid(),
  sound_post_id uuid not null references sound_posts(id) on delete cascade,
  reporter_user_id uuid references profiles(id) on delete set null,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

alter table sound_reports enable row level security;

-- Anyone (including anonymous) can submit a report
create policy "Anyone can create a report"
  on sound_reports for insert
  with check (true);

-- No public read access to reports (admin-only via dashboard)

-- ============================================================
-- PUBLIC VIEW (excludes private coordinates)
-- ============================================================

create view public_sound_posts as
  select
    sp.id,
    sp.user_id,
    sp.title,
    sp.note,
    sp.audio_path,
    sp.duration_seconds,
    sp.public_area_index,
    sp.public_area_label,
    sp.public_latitude,
    sp.public_longitude,
    sp.location_source,
    sp.recorded_at,
    sp.created_at,
    sp.updated_at,
    sp.status,
    sp.is_public,
    p.username,
    p.display_name,
    p.avatar_url
  from sound_posts sp
  join profiles p on p.id = sp.user_id
  where sp.status = 'active' and sp.is_public = true;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sound_posts_area
  on sound_posts (public_area_index)
  where status = 'active' and is_public = true;

create index idx_sound_posts_user
  on sound_posts (user_id);

create index idx_profiles_username
  on profiles (username);
