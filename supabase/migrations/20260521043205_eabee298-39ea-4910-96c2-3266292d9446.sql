-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text,
  shift_pattern text,
  timezone text not null default 'UTC',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============ categories (reference) ============
create table public.categories (
  id text primary key,
  label text not null,
  color text not null,
  icon text not null,
  sort_order int not null default 0
);

alter table public.categories enable row level security;

create policy "categories_select_all" on public.categories
  for select to authenticated, anon using (true);

insert into public.categories (id, label, color, icon, sort_order) values
  ('work',     'Work',     '#3B82F6', 'Briefcase', 1),
  ('rest',     'Rest',     '#8B5CF6', 'Moon',      2),
  ('wellness', 'Wellness', '#EC4899', 'Heart',     3),
  ('exercise', 'Exercise', '#F59E0B', 'Dumbbell',  4),
  ('social',   'Social',   '#10B981', 'Users',     5),
  ('family',   'Family',   '#EF4444', 'Home',      6),
  ('personal', 'Personal', '#6B7280', 'Sparkles',  7);

-- ============ events ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null references public.categories(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  shift_type text,
  location text,
  notes text,
  icon_name text,
  recurrence jsonb not null default '{"kind":"none"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_check check (ends_at > starts_at),
  constraint events_shift_type_check check (shift_type is null or shift_type in ('morning','afternoon','night','oncall'))
);

create index events_user_starts_idx on public.events (user_id, starts_at);
create index events_user_category_idx on public.events (user_id, category);

alter table public.events enable row level security;

create policy "events_select_own" on public.events
  for select to authenticated using (user_id = auth.uid());
create policy "events_insert_own" on public.events
  for insert to authenticated with check (user_id = auth.uid());
create policy "events_update_own" on public.events
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "events_delete_own" on public.events
  for delete to authenticated using (user_id = auth.uid());

-- ============ user_preferences ============
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark',
  default_view text not null default 'week',
  week_starts_on int2 not null default 1,
  reminders jsonb not null default '{}'::jsonb,
  sounds jsonb not null default '{}'::jsonb,
  email text,
  phone text,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "preferences_select_own" on public.user_preferences
  for select to authenticated using (user_id = auth.uid());
create policy "preferences_insert_own" on public.user_preferences
  for insert to authenticated with check (user_id = auth.uid());
create policy "preferences_update_own" on public.user_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ updated_at triggers ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger preferences_set_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ============ Provision profile + preferences on signup ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
