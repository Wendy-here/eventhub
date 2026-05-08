-- =============================================================================
-- EventHub — Missing schema fix
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- 1. Add missing columns to events (safe if already present)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_time      text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS timezone        text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url text;

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

-- 8. Notifications table and trigger
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email   text        NOT NULL,
  event_id     uuid        REFERENCES public.events(id) ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('new_event', 'reminder_1d', 'reminder_1h')),
  title        text        NOT NULL,
  body         text,
  read         boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL             ON public.notifications TO service_role;

CREATE POLICY "notif_select" ON public.notifications FOR SELECT TO authenticated USING (auth.email() = user_email);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.email() = user_email);
CREATE POLICY "notif_insert_service" ON public.notifications FOR INSERT TO service_role WITH CHECK (true);

-- Fan-out new_event notification to all users on event insert
CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_email, event_id, type, title, body)
  SELECT u.email, NEW.id, 'new_event',
    'New event: ' || NEW.title,
    'On ' || to_char(NEW.date::date, 'DD Mon YYYY') ||
    CASE WHEN NEW.location IS NOT NULL THEN ' · ' || NEW.location ELSE '' END
  FROM auth.users u
  WHERE u.email IS NOT NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_created ON public.events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_event();

-- Optional: call manually or from a cron job to create reminder notifications
CREATE OR REPLACE FUNCTION public.create_event_reminders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_email, event_id, type, title, body)
  SELECT u.email, e.id, 'reminder_1d',
    'Tomorrow: ' || e.title,
    'Happening tomorrow at ' || COALESCE(e.event_time, 'TBD') || COALESCE(' · ' || e.location, '')
  FROM public.events e CROSS JOIN auth.users u
  WHERE e.date = CURRENT_DATE + INTERVAL '1 day' AND u.email IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.event_id = e.id AND n.user_email = u.email AND n.type = 'reminder_1d');

  INSERT INTO public.notifications (user_email, event_id, type, title, body)
  SELECT u.email, e.id, 'reminder_1h',
    'Starting soon: ' || e.title,
    'Starts in about 1 hour' || COALESCE(' · ' || e.location, '')
  FROM public.events e CROSS JOIN auth.users u
  WHERE e.date = CURRENT_DATE AND e.event_time IS NOT NULL
    AND (e.date::timestamp + e.event_time::time) BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
    AND u.email IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.event_id = e.id AND n.user_email = u.email AND n.type = 'reminder_1h');
END;
$$;

-- 9. Reload PostgREST schema cache — clears the "table not found" error immediately
NOTIFY pgrst, 'reload schema';
