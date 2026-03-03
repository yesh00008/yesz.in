
-- Notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification on new comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  post_title text;
  commenter_name text;
BEGIN
  SELECT author_id, title INTO post_author_id, post_title
  FROM public.posts WHERE id = NEW.post_id;
  
  IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
    SELECT COALESCE(display_name, 'Someone') INTO commenter_name
    FROM public.profiles WHERE user_id = NEW.user_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (post_author_id, 'comment', 'New comment', commenter_name || ' commented on "' || post_title || '"', '/post/' || (SELECT slug FROM public.posts WHERE id = NEW.post_id));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER IF NOT EXISTS on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Function to create notification on new follow
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, 'Someone') INTO follower_name
  FROM public.profiles WHERE user_id = NEW.follower_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (NEW.following_id, 'follow', 'New follower', follower_name || ' started following you', '/' || follower_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER IF NOT EXISTS on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();
