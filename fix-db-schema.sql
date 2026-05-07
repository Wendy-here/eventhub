-- =============================================================================
-- EventHub — Missing schema fix
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- 1. Add missing columns to events (safe if already present)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS timezone    text;

-- 2. Create attendances table
CREATE TABLE IF NOT EXISTS public.attendances (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_email  text        NOT NULL,
  user_name   text        NOT NULL,
  status      text        NOT NULL CHECK (status IN ('yes', 'maybe', 'no')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendances_event_user_unique UNIQUE (event_id, user_email)
);

-- 3. Grant table-level permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendances TO authenticated;
GRANT SELECT                          ON public.attendances TO anon;
GRANT ALL                             ON public.attendances TO service_role;

-- 4. Enable Row Level Security
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
-- Anyone authenticated can read all attendances (to show counts)
CREATE POLICY "att_select"
  ON public.attendances FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert only their own row
CREATE POLICY "att_insert"
  ON public.attendances FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = user_email);

-- Users can update only their own row
CREATE POLICY "att_update"
  ON public.attendances FOR UPDATE
  TO authenticated
  USING      (auth.email() = user_email)
  WITH CHECK (auth.email() = user_email);

-- Users can delete only their own row
CREATE POLICY "att_delete"
  ON public.attendances FOR DELETE
  TO authenticated
  USING (auth.email() = user_email);

-- 6. Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_attendances_updated_at ON public.attendances;
CREATE TRIGGER set_attendances_updated_at
  BEFORE UPDATE ON public.attendances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Ensure events table has an INSERT policy for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'events'
      AND policyname = 'events_insert'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "events_insert"
        ON public.events FOR INSERT
        TO authenticated
        WITH CHECK (true);
    $policy$;
  END IF;
END;
$$;

-- 8. Reload PostgREST schema cache — clears the "table not found" error immediately
NOTIFY pgrst, 'reload schema';
