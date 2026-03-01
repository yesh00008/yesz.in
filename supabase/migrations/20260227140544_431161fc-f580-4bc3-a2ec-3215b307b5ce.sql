
-- Fix overly permissive tag creation policy
DROP POLICY "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (
  length(name) > 0 AND length(slug) > 0
);
