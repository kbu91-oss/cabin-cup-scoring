-- Cabin Cup — per-row schema (v2)
-- Replaces the single cup_state blob with per-row tables so concurrent
-- edits to different matches/players don't clobber each other.
--
-- Paste this whole thing into Supabase → SQL Editor → New query → Run.
-- It's idempotent (safe to re-run).

-- =====================================================================
-- TABLES
-- =====================================================================

create table if not exists golf_matches (
  year       integer not null,
  match_id   integer not null,
  state      jsonb   not null,
  updated_at timestamptz not null default now(),
  primary key (year, match_id)
);

create table if not exists drinking_matches (
  year       integer not null,
  event_id   text    not null,  -- 'beer-die' | 'bags' | 'beer-pong'
  match_id   text    not null,
  state      jsonb   not null,
  updated_at timestamptz not null default now(),
  primary key (year, event_id, match_id)
);

-- Singleton-style fields per year: small enough to share a row, won't conflict.
create table if not exists cup_meta (
  year                 integer primary key,
  beer_pong_winner     text,
  beer_pong_status     text not null default 'in-progress',
  mvp_results_revealed boolean not null default false,
  updated_at           timestamptz not null default now()
);

create table if not exists mvp_votes (
  year       integer not null,
  voter_id   text not null,
  first_pick  text,
  second_pick text,
  third_pick  text,
  vote_ts     bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (year, voter_id)
);

create table if not exists lunch_orders (
  year       integer not null,
  player_id  text not null,
  items      jsonb  not null default '[]'::jsonb,
  order_ts   bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (year, player_id)
);

create table if not exists travel_arrivals (
  year       integer not null,
  player_id  text not null,
  arr_date   text not null,
  arr_time   text not null,
  mode       text,
  airport    text,
  notes      text,
  arr_ts     bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (year, player_id)
);

-- =====================================================================
-- RLS — anyone can read/write (casual tournament, no auth).
-- =====================================================================

do $$
declare t text;
begin
  for t in select unnest(array[
    'golf_matches','drinking_matches','cup_meta',
    'mvp_votes','lunch_orders','travel_arrivals'
  ]) loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anyone can read %s" on %I', t, t);
    execute format('drop policy if exists "anyone can write %s" on %I', t, t);
    execute format(
      'create policy "anyone can read %s" on %I for select using (true)',
      t, t
    );
    execute format(
      'create policy "anyone can write %s" on %I for all using (true) with check (true)',
      t, t
    );
  end loop;
end $$;

-- =====================================================================
-- REALTIME — add each table to the realtime publication + replica identity full
-- so every device receives the full row on UPDATE.
-- =====================================================================

do $$
declare t text;
begin
  for t in select unnest(array[
    'golf_matches','drinking_matches','cup_meta',
    'mvp_votes','lunch_orders','travel_arrivals'
  ]) loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
    execute format('alter table %I replica identity full', t);
  end loop;
end $$;
