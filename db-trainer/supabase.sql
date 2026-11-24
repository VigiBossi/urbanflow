-- =====================================================================
--  DB TRAINER — Supabase setup
--  Paste ALL of this into Supabase → SQL Editor → New query → Run.
--  It is safe to run again (it drops and recreates policies/views).
-- =====================================================================

-- ---------- 1. TABLES ----------
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null check (char_length(name) between 2 and 30),
  created_at timestamptz default now()
);
-- names are unique ignoring upper/lower case ("Anna" = "anna")
create unique index if not exists users_name_lower_idx on public.users (lower(name));

create table if not exists public.progress (
  user_id    uuid not null references public.users(id) on delete cascade,
  item_id    text not null,          -- e.g. 'lesson:m1l2', 'ex:m3e4', 'quiz:m2l1', 'meta:streak'
  status     text,                   -- 'started' | 'done' | 'attempted' | 'solved' | ...
  score      int,
  attempts   int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, item_id)
);

create table if not exists public.mistakes (
  id         bigserial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  category   text not null,          -- e.g. 'weak-entity-key', 'fk-wrong-side-1to1'
  item_id    text,
  created_at timestamptz default now()
);
create index if not exists mistakes_user_idx on public.mistakes (user_id);

create table if not exists public.exam_results (
  id         bigserial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  score      int not null,
  max_score  int not null,
  breakdown  jsonb,
  taken_at   timestamptz default now()
);
create index if not exists exam_results_user_idx on public.exam_results (user_id);

create table if not exists public.flashcards (
  user_id       uuid not null references public.users(id) on delete cascade,
  card_id       text not null,
  due_at        timestamptz,
  interval_days real,
  ease          real,
  primary key (user_id, card_id)
);

-- ---------- 2. WHO IS CALLING? ----------
-- There is no password login. The app sends the logged-in user's id in an
-- HTTP header "x-user-id". PostgREST exposes request headers to SQL, so the
-- policies below can compare a row's user_id with that header.
create or replace function public.app_user_id() returns uuid
language plpgsql stable as $$
declare h text;
begin
  h := current_setting('request.headers', true)::json ->> 'x-user-id';
  return h::uuid;
exception when others then
  return null;   -- header missing or not a valid uuid
end $$;

-- ---------- 3. ROW LEVEL SECURITY ----------
alter table public.users        enable row level security;
alter table public.progress     enable row level security;
alter table public.mistakes     enable row level security;
alter table public.exam_results enable row level security;
alter table public.flashcards   enable row level security;

-- users: anyone can read names (needed to log in by name) and sign up
drop policy if exists users_select on public.users;
drop policy if exists users_insert on public.users;
drop policy if exists users_update on public.users;
create policy users_select on public.users for select to anon using (true);
create policy users_insert on public.users for insert to anon with check (true);
create policy users_update on public.users for update to anon
  using (id = public.app_user_id()) with check (id = public.app_user_id());

-- progress / flashcards: read all, insert + update only your own rows
drop policy if exists progress_select on public.progress;
drop policy if exists progress_insert on public.progress;
drop policy if exists progress_update on public.progress;
create policy progress_select on public.progress for select to anon using (true);
create policy progress_insert on public.progress for insert to anon with check (user_id = public.app_user_id());
create policy progress_update on public.progress for update to anon
  using (user_id = public.app_user_id()) with check (user_id = public.app_user_id());

drop policy if exists flashcards_select on public.flashcards;
drop policy if exists flashcards_insert on public.flashcards;
drop policy if exists flashcards_update on public.flashcards;
create policy flashcards_select on public.flashcards for select to anon using (true);
create policy flashcards_insert on public.flashcards for insert to anon with check (user_id = public.app_user_id());
create policy flashcards_update on public.flashcards for update to anon
  using (user_id = public.app_user_id()) with check (user_id = public.app_user_id());

-- mistakes / exam_results: read all, insert your own (history is never edited)
drop policy if exists mistakes_select on public.mistakes;
drop policy if exists mistakes_insert on public.mistakes;
create policy mistakes_select on public.mistakes for select to anon using (true);
create policy mistakes_insert on public.mistakes for insert to anon with check (user_id = public.app_user_id());

drop policy if exists exam_results_select on public.exam_results;
drop policy if exists exam_results_insert on public.exam_results;
create policy exam_results_select on public.exam_results for select to anon using (true);
create policy exam_results_insert on public.exam_results for insert to anon with check (user_id = public.app_user_id());

-- ---------- 4. PERMISSIONS for the anon (public) role ----------
grant usage on schema public to anon;
grant select, insert, update on public.users, public.progress, public.flashcards to anon;
grant select, insert on public.mistakes, public.exam_results to anon;
grant usage, select on sequence public.mistakes_id_seq, public.exam_results_id_seq to anon;
grant execute on function public.app_user_id() to anon;

-- ---------- 5. LEADERBOARD VIEW ----------
-- A view = a stored query. It joins users with their progress and exam results.
-- Users who opted out have a progress row ('meta:leaderboard', status 'hidden').
create or replace view public.leaderboard with (security_invoker = true) as
select
  u.name,
  (select count(*) from public.progress p
     where p.user_id = u.id and p.item_id like 'lesson:%' and p.status = 'done')::int as lessons_completed,
  (select max(round(100.0 * e.score / nullif(e.max_score, 0)))
     from public.exam_results e where e.user_id = u.id)::int as best_exam_pct,
  coalesce((select case when p.status ~ '^\d{4}-\d{2}-\d{2}$'
                         and p.status::date >= current_date - 1 then p.score else 0 end
            from public.progress p
            where p.user_id = u.id and p.item_id = 'meta:streak'), 0) as current_streak
from public.users u
where not exists (select 1 from public.progress p
                  where p.user_id = u.id and p.item_id = 'meta:leaderboard' and p.status = 'hidden');

grant select on public.leaderboard to anon;

-- Done! Check: Table Editor should now show users, progress, mistakes, exam_results, flashcards.
