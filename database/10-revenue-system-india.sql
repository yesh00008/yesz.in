-- India Revenue System with Razorpay Integration (INR Pricing)
-- All prices in Indian Rupees (₹)

-- 1. Creator Subscriptions (Pro Plan: ₹749/month)
CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'pro', -- 'pro', 'premium'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  monthly_price INTEGER NOT NULL DEFAULT 749, -- in paise (₹7.49 = 749 paise)
  razorpay_subscription_id VARCHAR(255) UNIQUE,
  razorpay_plan_id VARCHAR(255),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  renewal_date TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payments & Invoices
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_inr INTEGER NOT NULL, -- stored in paise
  payment_type VARCHAR(50) NOT NULL, -- 'subscription', 'course', 'job_posting', 'sponsored', 'event', 'gift'
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_order_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
  reference_id VARCHAR(255), -- links to course_id, job_id, etc
  description TEXT,
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Premium Articles (Paywall)
CREATE TABLE IF NOT EXISTS premium_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  price_inr INTEGER NOT NULL DEFAULT 41500, -- ₹415 = 41,500 paise (approx $5/month)
  access_type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'one_time', 'monthly', 'yearly'
  preview_content TEXT, -- First 500 chars shown for free
  full_content TEXT, -- Full article content
  purchase_count INTEGER DEFAULT 0,
  revenue_inr INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Premium Article Access (Who has purchased which articles)
CREATE TABLE IF NOT EXISTS premium_article_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES premium_articles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  access_until TIMESTAMP, -- for monthly subscriptions
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

-- 5. Tech Job Board (₹20,670 - ₹83,000 per listing)
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company_name VARCHAR(255),
  job_type VARCHAR(50), -- 'full-time', 'contract', 'freelance'
  location VARCHAR(255),
  salary_min_inr INTEGER, -- in paise
  salary_max_inr INTEGER,
  category_id UUID REFERENCES categories(id),
  featured BOOLEAN DEFAULT FALSE,
  featured_price_inr INTEGER DEFAULT 41650, -- ₹416.50 (featured listing)
  payment_id UUID REFERENCES payments(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'filled', 'paused'
  posted_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL, -- 30 days from posting
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Affiliate Links System
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  affiliate_program VARCHAR(100) NOT NULL, -- 'nordvpn', 'hubspot', 'kinsta', 'offer_daily', 'refersion'
  commission_rate DECIMAL(5, 2) NOT NULL, -- 40%, 30%, etc
  affiliate_url TEXT NOT NULL,
  affiliate_id VARCHAR(255),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_inr INTEGER DEFAULT 0, -- in paise
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Paid Newsletter Tiers (₹580/month)
CREATE TABLE IF NOT EXISTS newsletter_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  monthly_price_inr INTEGER NOT NULL DEFAULT 58000, -- ₹580 = 58,000 paise
  frequency VARCHAR(50), -- 'weekly', 'twice_weekly', 'daily'
  subscriber_count INTEGER DEFAULT 0,
  revenue_inr INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES newsletter_tiers(id) ON DELETE CASCADE,
  razorpay_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled'
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  renewal_date TIMESTAMP,
  cancelled_at TIMESTAMP,
  UNIQUE(user_id, tier_id)
);

-- 8. Digital Courses & Ebooks (₹1,580 - ₹8,250)
CREATE TABLE IF NOT EXISTS digital_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price_inr INTEGER NOT NULL, -- in paise (1580 = ₹15.80)
  thumbnail_url VARCHAR(255),
  category VARCHAR(100),
  course_type VARCHAR(50) NOT NULL, -- 'course', 'ebook', 'tutorial_series'
  module_count INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  revenue_inr INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES digital_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_url VARCHAR(255), -- S3 link to video, PDF, etc
  duration_minutes INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES digital_courses(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- 9. Sponsored Content Marketplace (₹24,850 - ₹83,000)
CREATE TABLE IF NOT EXISTS sponsored_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  sponsor_user_id UUID NOT NULL REFERENCES auth.users(id), -- The sponsor (advertiser)
  content_creator_id UUID NOT NULL REFERENCES auth.users(id), -- The creator
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_inr INTEGER NOT NULL, -- in paise (2485000 = ₹24,850)
  sponsorship_type VARCHAR(50), -- 'article', 'newsletter', 'video', 'podcast'
  payment_id UUID REFERENCES payments(id),
  status VARCHAR(50) DEFAULT 'negotiation', -- 'negotiation', 'agreed', 'published', 'completed'
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Paid Virtual Events (₹750/ticket)
CREATE TABLE IF NOT EXISTS virtual_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  ticket_price_inr INTEGER NOT NULL DEFAULT 75000, -- ₹750 = 75,000 paise
  max_capacity INTEGER DEFAULT 500,
  current_attendance INTEGER DEFAULT 0,
  revenue_inr INTEGER DEFAULT 0,
  zoom_link VARCHAR(255),
  recording_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'live', 'ended', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES virtual_events(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended_at TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- 11. Creator Analytics Premium (upsell to Pro members)
CREATE TABLE IF NOT EXISTS creator_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  metric_date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_inr INTEGER DEFAULT 0,
  top_post_id UUID REFERENCES posts(id),
  top_post_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, metric_date)
);

-- 12. Creator Dashboard Premium Features
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL, -- 'advanced_analytics', 'seo_tools', 'scheduling', 'affiliate_tracking'
  is_enabled BOOLEAN DEFAULT FALSE,
  premium_tier VARCHAR(50) DEFAULT 'pro', -- 'pro', 'business'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, feature_name)
);

-- Indexes for performance
CREATE INDEX idx_creator_subscriptions_user ON creator_subscriptions(user_id);
CREATE INDEX idx_creator_subscriptions_status ON creator_subscriptions(status);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id);
CREATE INDEX idx_premium_articles_creator ON premium_articles(creator_id);
CREATE INDEX idx_premium_article_purchases_user ON premium_article_purchases(user_id);
CREATE INDEX idx_job_postings_creator ON job_postings(creator_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_affiliate_links_post ON affiliate_links(post_id);
CREATE INDEX idx_newsletter_subscriptions_user ON newsletter_subscriptions(user_id);
CREATE INDEX idx_newsletter_subscriptions_tier ON newsletter_subscriptions(tier_id);
CREATE INDEX idx_digital_courses_creator ON digital_courses(creator_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_sponsored_content_status ON sponsored_content(status);
CREATE INDEX idx_virtual_events_creator ON virtual_events(creator_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_creator_analytics_creator ON creator_analytics(creator_id);

-- Helper function: Get creator revenue summary
CREATE OR REPLACE FUNCTION get_creator_revenue_summary(creator_id_param UUID)
RETURNS TABLE (
  total_revenue_inr INTEGER,
  subscription_revenue INTEGER,
  course_revenue INTEGER,
  job_posting_revenue INTEGER,
  sponsored_revenue INTEGER,
  event_revenue INTEGER,
  subscriber_count INTEGER,
  total_subscribers INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(p.amount_inr), 0) as total_revenue_inr,
    COALESCE(SUM(CASE WHEN p.payment_type = 'subscription' THEN p.amount_inr ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.payment_type = 'course' THEN p.amount_inr ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.payment_type = 'job_posting' THEN p.amount_inr ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.payment_type = 'sponsored' THEN p.amount_inr ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.payment_type = 'event' THEN p.amount_inr ELSE 0 END), 0),
    (SELECT COUNT(*) FROM creator_subscriptions WHERE user_id = creator_id_param AND status = 'active'),
    (SELECT COUNT(*) FROM digital_courses WHERE creator_id = creator_id_param)
  FROM payments
  WHERE user_id = creator_id_param AND status = 'success';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for all tables
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_article_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Subscriptions: Users see only their own
CREATE POLICY "Users see their own subscriptions"
  ON creator_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own subscriptions"
  ON creator_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Payments: Users see only their own
CREATE POLICY "Users see their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Courses: All see published, creators manage their own
CREATE POLICY "All users see published courses"
  ON digital_courses FOR SELECT
  USING (published = true);

CREATE POLICY "Creators manage their own courses"
  ON digital_courses FOR ALL
  USING (auth.uid() = creator_id);

-- Job Postings: All see active, creators manage their own
CREATE POLICY "All see active job postings"
  ON job_postings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Creators manage their own jobs"
  ON job_postings FOR ALL
  USING (auth.uid() = creator_id);

-- Events: All see upcoming/live, creators manage their own
CREATE POLICY "All see public events"
  ON virtual_events FOR SELECT
  USING (status IN ('upcoming', 'live'));

CREATE POLICY "Creators manage their own events"
  ON virtual_events FOR ALL
  USING (auth.uid() = creator_id);
