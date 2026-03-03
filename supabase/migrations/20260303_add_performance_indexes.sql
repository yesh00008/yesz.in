-- Add performance indexes for faster profile and content queries

-- Index on profiles.display_name for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_display_name 
  ON public.profiles(display_name);

-- Index on posts.author_id and published for creator posts listing
CREATE INDEX IF NOT EXISTS idx_posts_author_published 
  ON public.posts(author_id, published);

-- Index on research_papers.author_id and published_at
CREATE INDEX IF NOT EXISTS idx_research_papers_author 
  ON public.research_papers(author_id, published_at DESC);

-- Index on follows.following_id for follower count queries
CREATE INDEX IF NOT EXISTS idx_follows_following_id 
  ON public.follows(following_id);

-- Index on follows.follower_id for user's following queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id 
  ON public.follows(follower_id);

-- Index on posts.created_at for ordering
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
  ON public.posts(created_at DESC);

-- Index on comments.post_id for notification queries
CREATE INDEX IF NOT EXISTS idx_comments_post_id 
  ON public.comments(post_id);

-- Index on notifications.user_id and read status for dashboard
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
  ON public.notifications(user_id, read);

-- Enable automatic index usage statistics
ANALYSE public.profiles;
ANALYSE public.posts;
ANALYSE public.research_papers;
ANALYSE public.follows;
