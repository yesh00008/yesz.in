
-- Tags table for SEO
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post-tags junction
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Creator tips/donations
CREATE TABLE public.creator_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  tipper_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add SEO fields to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- RLS for tags (public read)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

-- RLS for post_tags
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post tags are viewable by everyone" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage post tags" ON public.post_tags FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Authors can delete post tags" ON public.post_tags FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS for creator_tips
ALTER TABLE public.creator_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tips are viewable by creator" ON public.creator_tips FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "Authenticated users can tip" ON public.creator_tips FOR INSERT TO authenticated WITH CHECK (tipper_id = auth.uid());
