-- =============================================
-- YESZZ TECH — Seed Categories (All)
-- =============================================

INSERT INTO public.categories (name, slug, icon, description) VALUES
  ('AI', 'ai', '🤖', 'Artificial Intelligence, Machine Learning, and Deep Learning trends'),
  ('Cybersecurity', 'cybersecurity', '🔒', 'Security threats, privacy, and protection strategies'),
  ('Gadgets', 'gadgets', '📱', 'Latest devices, wearables, and consumer electronics'),
  ('Programming', 'programming', '💻', 'Languages, frameworks, developer tools, and best practices'),
  ('Reviews', 'reviews', '⭐', 'In-depth reviews of software, hardware, and services'),
  ('Startups', 'startups', '🚀', 'Startup ecosystem, funding, entrepreneurship, and innovation'),
  ('Cloud Computing', 'cloud-computing', '☁️', 'AWS, Azure, GCP, serverless, and cloud infrastructure'),
  ('Blockchain', 'blockchain', '⛓️', 'Cryptocurrency, Web3, DeFi, and blockchain technology'),
  ('Data Science', 'data-science', '📊', 'Big data, analytics, visualization, and data engineering'),
  ('DevOps', 'devops', '🔧', 'CI/CD, containers, Kubernetes, and infrastructure automation'),
  ('Mobile', 'mobile', '📲', 'iOS, Android, React Native, Flutter, and mobile development'),
  ('Gaming', 'gaming', '🎮', 'Game development, esports, gaming hardware, and industry news'),
  ('IoT', 'iot', '🌐', 'Internet of Things, smart devices, and embedded systems'),
  ('Fintech', 'fintech', '💰', 'Digital payments, UPI, neobanks, and financial technology in India'),
  ('EdTech', 'edtech', '🎓', 'Online learning platforms, coding bootcamps, and education technology'),
  ('Indian Tech', 'indian-tech', '🇮🇳', 'Indian startup ecosystem, Digital India initiatives, and tech innovation from India')
ON CONFLICT (name) DO NOTHING;
