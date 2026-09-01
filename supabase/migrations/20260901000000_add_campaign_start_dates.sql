alter table public.campaigns
  add column if not exists original_start_at timestamptz,
  add column if not exists effective_start_at timestamptz;