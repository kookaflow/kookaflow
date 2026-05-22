-- 1. shift_templates
create table public.shift_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 12),
  colour text not null,
  icon_name text,
  default_start time,
  default_end time,
  category text not null check (category in ('working','leave','non_working')),
  base_type text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shift_templates enable row level security;

create policy "shift_templates_select_own"
  on public.shift_templates for select to authenticated
  using (user_id = auth.uid());

create policy "shift_templates_insert_own"
  on public.shift_templates for insert to authenticated
  with check (user_id = auth.uid());

create policy "shift_templates_update_own"
  on public.shift_templates for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "shift_templates_delete_own"
  on public.shift_templates for delete to authenticated
  using (user_id = auth.uid());

create trigger shift_templates_set_updated_at
  before update on public.shift_templates
  for each row execute function public.set_updated_at();

create index shift_templates_user_idx on public.shift_templates (user_id, sort_order);

-- 2. Fix events.shift_type check constraint to include side_hustle
alter table public.events drop constraint if exists events_shift_type_check;
alter table public.events add constraint events_shift_type_check
  check (shift_type is null or shift_type in (
    'morning','afternoon','night','oncall','split',
    'side_hustle','sick_leave','annual_leave','travel','payday'
  ));
