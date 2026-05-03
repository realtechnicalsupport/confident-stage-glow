-- Add xp to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_xp_idx ON public.profiles (xp DESC);

-- Allow authenticated users to view all profiles (for leaderboard)
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_all_authenticated
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function: award XP when a recording is inserted
CREATE OR REPLACE FUNCTION public.award_xp_on_recording()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_xp integer := 10;
  duration_xp integer := 0;
  daily_bonus integer := 0;
  has_today boolean;
BEGIN
  duration_xp := COALESCE(NEW.duration_ms, 0) / 10000; -- 1 xp per 10s
  SELECT EXISTS (
    SELECT 1 FROM public.recordings
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND created_at::date = NEW.created_at::date
  ) INTO has_today;
  IF NOT has_today THEN
    daily_bonus := 5;
  END IF;

  UPDATE public.profiles
    SET xp = xp + base_xp + duration_xp + daily_bonus,
        updated_at = now()
    WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recordings_award_xp ON public.recordings;
CREATE TRIGGER recordings_award_xp
AFTER INSERT ON public.recordings
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_recording();