-- Cabin Cup — Supabase schema
-- Paste this into Supabase → SQL Editor → New query → Run.

create table if not exists cup_state (
  year        integer primary key,
  state       jsonb   not null,
  updated_at  timestamptz not null default now()
);

-- Anyone can read; anyone can write. Casual tournament, no auth.
alter table cup_state enable row level security;

drop policy if exists "anyone can read cup_state"  on cup_state;
drop policy if exists "anyone can write cup_state" on cup_state;

create policy "anyone can read cup_state"
  on cup_state for select
  using (true);

create policy "anyone can write cup_state"
  on cup_state for all
  using (true) with check (true);

-- Enable realtime broadcasts for this table.
-- Idempotent — skips silently if cup_state is already in the publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'cup_state'
  ) then
    alter publication supabase_realtime add table cup_state;
  end if;
end $$;

-- IMPORTANT: send the full row on UPDATEs (not just the primary key).
-- Without this, every device beyond the first one ignores updates because
-- the realtime payload arrives without the `state` field.
alter table cup_state replica identity full;
