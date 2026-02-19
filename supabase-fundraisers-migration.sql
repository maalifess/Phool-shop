-- Fundraisers schema migration (safe)
-- Adds: goal_pkr (numeric PKR), start_date, end_date, image

ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS goal_pkr BIGINT;

ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE public.fundraisers
  ADD COLUMN IF NOT EXISTS image TEXT;

-- Optional: backfill goal_pkr from existing goal text like 'PKR 5000' or '5000'
-- This is best-effort and safe to skip if your goal strings are messy.
UPDATE public.fundraisers
SET goal_pkr = NULLIF(regexp_replace(goal, '[^0-9]', '', 'g'), '')::BIGINT
WHERE goal_pkr IS NULL AND goal IS NOT NULL;
