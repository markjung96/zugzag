-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
-- auth.users는 Supabase Auth가 자동으로 관리하므로, 추가 정보만 profiles 테이블에 저장
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  nickname text,
  bio text,
  phone text,
  role text default 'member' check (role in ('admin', 'leader', 'member')),
  climbing_level text,
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create crews table (크루 정보)
create table public.crews (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  logo_url text,
  location text,
  max_members integer default 50,
  is_public boolean default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create crew_members table (크루원 관계)
create table public.crew_members (
  id uuid default uuid_generate_v4() primary key,
  crew_id uuid references public.crews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  is_active boolean default true,
  unique(crew_id, user_id)
);

-- Create climbing_sessions table (클라이밍 세션 기록)
create table public.climbing_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crew_id uuid references public.crews(id) on delete set null,
  location text,
  duration_minutes integer,
  difficulty_level text,
  notes text,
  photos jsonb default '[]'::jsonb,
  session_date timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create activity_logs table (활동 로그)
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crew_id uuid references public.crews(id) on delete cascade,
  activity_type text not null,
  activity_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.climbing_sessions enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Crews policies
create policy "Public crews are viewable by everyone"
  on public.crews for select
  using (is_public = true or exists (
    select 1 from public.crew_members
    where crew_members.crew_id = crews.id
    and crew_members.user_id = auth.uid()
  ));

create policy "Crew owners can update their crews"
  on public.crews for update
  using (exists (
    select 1 from public.crew_members
    where crew_members.crew_id = crews.id
    and crew_members.user_id = auth.uid()
    and crew_members.role in ('owner', 'admin')
  ));

create policy "Authenticated users can create crews"
  on public.crews for insert
  with check (auth.uid() = created_by);

-- Crew members policies
create policy "Crew members are viewable by crew members"
  on public.crew_members for select
  using (exists (
    select 1 from public.crew_members cm
    where cm.crew_id = crew_members.crew_id
    and cm.user_id = auth.uid()
  ));

create policy "Crew admins can manage members"
  on public.crew_members for all
  using (exists (
    select 1 from public.crew_members cm
    where cm.crew_id = crew_members.crew_id
    and cm.user_id = auth.uid()
    and cm.role in ('owner', 'admin')
  ));

-- Climbing sessions policies
create policy "Users can view own sessions"
  on public.climbing_sessions for select
  using (user_id = auth.uid() or exists (
    select 1 from public.crew_members
    where crew_members.crew_id = climbing_sessions.crew_id
    and crew_members.user_id = auth.uid()
  ));

create policy "Users can create own sessions"
  on public.climbing_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.climbing_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.climbing_sessions for delete
  using (auth.uid() = user_id);

-- Activity logs policies
create policy "Users can view own activity logs"
  on public.activity_logs for select
  using (user_id = auth.uid() or exists (
    select 1 from public.crew_members
    where crew_members.crew_id = activity_logs.crew_id
    and crew_members.user_id = auth.uid()
  ));

-- Functions
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_crews_updated_at
  before update on public.crews
  for each row execute function public.handle_updated_at();

create trigger handle_climbing_sessions_updated_at
  before update on public.climbing_sessions
  for each row execute function public.handle_updated_at();

-- Create indexes for better performance
create index profiles_email_idx on public.profiles(email);
create index crew_members_user_id_idx on public.crew_members(user_id);
create index crew_members_crew_id_idx on public.crew_members(crew_id);
create index climbing_sessions_user_id_idx on public.climbing_sessions(user_id);
create index climbing_sessions_crew_id_idx on public.climbing_sessions(crew_id);
create index climbing_sessions_session_date_idx on public.climbing_sessions(session_date);
create index activity_logs_user_id_idx on public.activity_logs(user_id);
create index activity_logs_crew_id_idx on public.activity_logs(crew_id);
create index activity_logs_created_at_idx on public.activity_logs(created_at);

