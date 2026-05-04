CREATE TABLE public.recording_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL UNIQUE REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  transcript text,
  summary text NOT NULL,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  improvements jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_drill text,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recording_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rf_select_own" ON public.recording_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rf_insert_own" ON public.recording_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rf_delete_own" ON public.recording_feedback
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_recording_feedback_user ON public.recording_feedback(user_id, created_at DESC);