-- =============================================
-- ADVANCED FEATURES SCHEMA
-- Content Analytics, Roles, Notifications, Social
-- =============================================

-- ==================== USER ROLES & PERMISSIONS ====================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'creator', 'moderator', 'admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- ==================== CONTENT ANALYTICS ====================
CREATE TABLE public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_read_time_seconds INTEGER,
  bounce_rate FLOAT DEFAULT 0,
  scroll_depth FLOAT DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  reactions JSONB DEFAULT '{"like":0,"love":0,"interesting":0}',
  last_viewed TIMESTAMP WITH TIME ZONE,
  trending_score FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_analytics_content ON public.content_analytics(content_id, content_type);
CREATE INDEX idx_content_analytics_trending ON public.content_analytics(trending_score DESC);
CREATE INDEX idx_content_analytics_date ON public.content_analytics(updated_at DESC);

-- ==================== EMAIL SUBSCRIPTIONS ====================
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  newsletter BOOLEAN NOT NULL DEFAULT true,
  new_posts BOOLEAN NOT NULL DEFAULT true,
  new_papers BOOLEAN NOT NULL DEFAULT true,
  author_updates BOOLEAN NOT NULL DEFAULT false,
  category_digests JSONB DEFAULT '[]'::jsonb,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'never')),
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

CREATE INDEX idx_email_subscriptions_user ON public.email_subscriptions(user_id);
CREATE INDEX idx_email_subscriptions_frequency ON public.email_subscriptions(frequency);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'post_published', 'paper_published', 'author_post', 'mention', 'follower_active')),
  title TEXT NOT NULL,
  message TEXT,
  related_content_id UUID,
  related_user_id UUID REFERENCES auth.users(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_date ON public.notifications(created_at DESC);

-- ==================== ADVANCED COMMENTS WITH THREADING ====================
CREATE TABLE public.comment_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comment_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  unhelpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_comment_threads_content ON public.comment_threads(content_id, content_type);
CREATE INDEX idx_comment_threads_author ON public.comment_threads(author_id);
CREATE INDEX idx_comment_threads_parent ON public.comment_threads(parent_comment_id);
CREATE INDEX idx_comment_threads_date ON public.comment_threads(created_at DESC);

-- ==================== CONTENT COLLABORATION ====================
CREATE TABLE public.content_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('editor', 'reviewer', 'contributor')),
  contribution_percentage INTEGER DEFAULT 0 CHECK (contribution_percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_collaborators_content ON public.content_collaborators(content_id, content_type);
CREATE INDEX idx_content_collaborators_user ON public.content_collaborators(collaborator_id);
CREATE INDEX idx_content_collaborators_status ON public.content_collaborators(status);

-- ==================== CONTENT SCHEDULING ====================
CREATE TABLE public.scheduled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  scheduled_publish_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_scheduled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_content_publish ON public.scheduled_content(scheduled_publish_at);
CREATE INDEX idx_scheduled_content_author ON public.scheduled_content(author_id);
CREATE INDEX idx_scheduled_content_status ON public.scheduled_content(status);

-- ==================== SOCIAL FEATURES ====================
CREATE TABLE public.user_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_followers_follower ON public.user_followers(follower_id);
CREATE INDEX idx_user_followers_following ON public.user_followers(following_id);

-- User activity feed
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post_published', 'paper_published', 'user_followed', 'post_liked', 'commented')),
  related_content_id UUID,
  related_user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_date ON public.user_activity(created_at DESC);

-- Creator verification/badges
CREATE TABLE public.creator_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  badge_type TEXT,
  total_posts INTEGER NOT NULL DEFAULT 0,
  total_papers INTEGER NOT NULL DEFAULT 0,
  total_followers INTEGER NOT NULL DEFAULT 0,
  badge_awarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_creator_badges_verified ON public.creator_badges(is_verified);
CREATE INDEX idx_creator_badges_featured ON public.creator_badges(is_featured);

-- ==================== RECOMMENDATIONS ENGINE ====================
CREATE TABLE public.content_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  reason TEXT,
  score FLOAT NOT NULL DEFAULT 0,
  is_clicked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_recommendations_user ON public.content_recommendations(user_id);
CREATE INDEX idx_content_recommendations_score ON public.content_recommendations(score DESC);
CREATE INDEX idx_content_recommendations_date ON public.content_recommendations(created_at DESC);

-- User reading history (for recommendations)
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  read_duration_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reading_history_user ON public.reading_history(user_id);
CREATE INDEX idx_reading_history_content ON public.reading_history(content_id, content_type);

-- ==================== CITATION EXPORTS ====================
CREATE TABLE public.citation_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'paper')),
  export_format TEXT NOT NULL CHECK (export_format IN ('bibtex', 'apa', 'chicago', 'mla', 'harvard')),
  export_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_citation_exports_content ON public.citation_exports(content_id, content_type);

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON public.email_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable" ON public.comment_threads
  FOR SELECT USING (is_approved = true OR auth.uid() = author_id);

CREATE POLICY "Users can view followers/following" ON public.user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reading history" ON public.reading_history
  FOR SELECT USING (auth.uid() = user_id);

-- ==================== HELPER FUNCTIONS ====================

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_views INTEGER,
  p_shares INTEGER,
  p_reactions JSONB,
  p_days_old INTEGER
) RETURNS FLOAT AS $$
BEGIN
  RETURN (
    p_views * 0.5 + 
    p_shares * 2.0 + 
    COALESCE((p_reactions->>'like')::INTEGER, 0) * 0.3 +
    COALESCE((p_reactions->>'love')::INTEGER, 0) * 0.5
  ) / (GREATEST(p_days_old, 1) ^ 1.5);
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendations for user
CREATE OR REPLACE FUNCTION get_user_recommendations(p_user_id UUID)
RETURNS TABLE (content_id UUID, content_type TEXT, score FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT cr.recommended_content_id, cr.content_type, cr.score
  FROM public.content_recommendations cr
  WHERE cr.user_id = p_user_id
    AND NOT cr.is_clicked
  ORDER BY cr.score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ==================== VIEWS FOR ANALYTICS ====================

-- Popular posts view
CREATE VIEW popular_content_view AS
SELECT 
  ca.content_id,
  ca.content_type,
  ca.views,
  ca.shares,
  ca.reactions,
  ca.trending_score,
  CASE WHEN ca.content_type = 'post' THEN p.title ELSE rp.title END as title,
  CASE WHEN ca.content_type = 'post' THEN p.author_id ELSE rp.author_id END as author_id
FROM public.content_analytics ca
LEFT JOIN public.posts p ON ca.content_id = p.id AND ca.content_type = 'post'
LEFT JOIN public.research_papers rp ON ca.content_id = rp.id AND ca.content_type = 'paper'
WHERE ca.trending_score > 0
ORDER BY ca.trending_score DESC;

-- Creator stats view
CREATE VIEW creator_stats_view AS
SELECT 
  u.id as creator_id,
  u.email,
  u.user_metadata->>'name' as name,
  COALESCE(uf_count.follower_count, 0) as followers,
  COALESCE(post_count.total_posts, 0) as published_posts,
  COALESCE(paper_count.total_papers, 0) as published_papers,
  COALESCE(total_views.total_views, 0) as total_views,
  COALESCE(cb.is_verified, false) as is_verified,
  COALESCE(cb.is_featured, false) as is_featured
FROM auth.users u
LEFT JOIN (SELECT following_id, COUNT(*) as follower_count FROM public.user_followers GROUP BY following_id) uf_count ON u.id = uf_count.following_id
LEFT JOIN (SELECT author_id, COUNT(*) as total_posts FROM public.posts WHERE published = true GROUP BY author_id) post_count ON u.id = post_count.author_id
LEFT JOIN (SELECT author_id, COUNT(*) as total_papers FROM public.research_papers WHERE published = true GROUP BY author_id) paper_count ON u.id = paper_count.author_id
LEFT JOIN (SELECT content_type, SUM(views) as total_views FROM public.content_analytics WHERE content_type = 'post' GROUP BY content_type) total_views ON true
LEFT JOIN public.creator_badges cb ON u.id = cb.user_id;
