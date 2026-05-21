-- Categories: per-user ownership + active flag
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);

-- Replace RLS
DROP POLICY IF EXISTS categories_select_all ON public.categories;

CREATE POLICY categories_select_visible ON public.categories
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY categories_select_anon_system ON public.categories
  FOR SELECT TO anon
  USING (user_id IS NULL);

CREATE POLICY categories_insert_own ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY categories_update_own ON public.categories
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY categories_delete_own ON public.categories
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- Per-user visibility for system categories
CREATE TABLE IF NOT EXISTS public.user_category_visibility (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  hidden boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category_id)
);

ALTER TABLE public.user_category_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY ucv_select_own ON public.user_category_visibility
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY ucv_insert_own ON public.user_category_visibility
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY ucv_update_own ON public.user_category_visibility
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY ucv_delete_own ON public.user_category_visibility
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Events: replace gradient with hex colour
ALTER TABLE public.events DROP COLUMN IF EXISTS icon_gradient;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS icon_color text;