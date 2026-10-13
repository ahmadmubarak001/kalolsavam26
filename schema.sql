-- Run in Supabase SQL Editor. Create admin users separately in Authentication.
create table if not exists public.kalolsavam_events (
  id text primary key, name text not null, category text not null default 'General',
  date date, time text not null default '', venue text not null default '',
  status text not null default 'upcoming' check (status in ('upcoming','completed')),
  icon text not null default ''
);
create table if not exists public.kalolsavam_results (
  id text primary key, name text not null, event_id text not null references public.kalolsavam_events(id) on update cascade on delete cascade,
  class_name text not null default '', place integer not null default 0,
  score numeric, published boolean not null default false
);
create table if not exists public.kalolsavam_settings (
  id integer primary key check (id = 1), site jsonb not null default '{}'::jsonb
);
alter table public.kalolsavam_events enable row level security;
alter table public.kalolsavam_results enable row level security;
alter table public.kalolsavam_settings enable row level security;
-- Public can read events and published results. Only users whose Supabase app_metadata role is 'admin' can manage rows.
create or replace function public.is_kalolsavam_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;
drop policy if exists "Public read events" on public.kalolsavam_events;
create policy "Public read events" on public.kalolsavam_events for select using (true);
drop policy if exists "Admin manage events" on public.kalolsavam_events;
create policy "Admin manage events" on public.kalolsavam_events for all to authenticated using (public.is_kalolsavam_admin()) with check (public.is_kalolsavam_admin());
drop policy if exists "Public read published results" on public.kalolsavam_results;
create policy "Public read published results" on public.kalolsavam_results for select using (published = true);
drop policy if exists "Admin read all results" on public.kalolsavam_results;
create policy "Admin read all results" on public.kalolsavam_results for select to authenticated using (public.is_kalolsavam_admin());
drop policy if exists "Admin manage results" on public.kalolsavam_results;
create policy "Admin manage results" on public.kalolsavam_results for all to authenticated using (public.is_kalolsavam_admin()) with check (public.is_kalolsavam_admin());
drop policy if exists "Public read settings" on public.kalolsavam_settings;
create policy "Public read settings" on public.kalolsavam_settings for select using (true);
drop policy if exists "Admin manage settings" on public.kalolsavam_settings;
create policy "Admin manage settings" on public.kalolsavam_settings for all to authenticated using (public.is_kalolsavam_admin()) with check (public.is_kalolsavam_admin());
-- Optional: add an initial settings row. Website editor fills this after first admin save.
insert into public.kalolsavam_settings (id, site) values (1, '{}'::jsonb) on conflict (id) do nothing;
