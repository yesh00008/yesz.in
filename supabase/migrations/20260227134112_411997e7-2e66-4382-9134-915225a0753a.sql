
-- Fix: restrict newsletter insert to only email column by adding a check
DROP POLICY "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with email" ON public.newsletter_subscribers FOR INSERT WITH CHECK (email IS NOT NULL AND length(email) > 0 AND length(email) < 256);
