-- Early wrap override: when a vehicle is wrapped ahead of schedule, this locks
-- the campaign's effective start (and therefore finish) date to the actual wrap date.
alter table public.campaigns
  add column if not exists actual_wrap_at timestamptz;
