-- =============================================
-- YESZZ TECH — Research Papers Table
-- =============================================

CREATE TABLE public.research_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  abstract TEXT,
  content TEXT,                      -- JSON block-based content
  cover_image TEXT,
  category_id UUID REFERENCES public.categories(id),
  author_id UUID REFERENCES auth.users(id),
  authors_list TEXT,                 -- comma-separated author names
  institution TEXT,
  doi TEXT UNIQUE,                          -- Digital Object Identifier
  keywords TEXT,                     -- comma-separated keywords
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  peer_reviewed BOOLEAN NOT NULL DEFAULT false,
  read_time TEXT DEFAULT '15 min',
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  citations INTEGER NOT NULL DEFAULT 0,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),    -- draft | review | published
  paper_type TEXT DEFAULT 'research' CHECK (paper_type IN ('research', 'review', 'survey', 'case-study', 'whitepaper')),      -- research | review | survey | case-study | whitepaper
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published research papers are viewable by everyone"
  ON public.research_papers FOR SELECT USING (published = true);
CREATE POLICY "Authors can manage their own research papers"
  ON public.research_papers FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Index for fast slug lookups
CREATE INDEX idx_research_papers_slug ON public.research_papers(slug);
CREATE INDEX idx_research_papers_category ON public.research_papers(category_id);
CREATE INDEX idx_research_papers_published ON public.research_papers(published, published_at DESC);
