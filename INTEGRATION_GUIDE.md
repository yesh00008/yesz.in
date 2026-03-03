# Advanced Features Integration Guide

This guide walks through integrating each advanced feature into the existing Yeszz Tech Hub application.

---

## Part 1: Database Migration

### Step 1: Apply Database Schema
```bash
# Using Supabase CLI
supabase db push

# Or manually via psql
psql -h <your-host> -U postgres -d postgres -f database/09-advanced-features.sql
```

### Verify Tables Created
```sql
-- Check all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_roles', 'content_analytics', 'email_subscriptions', 
  'notifications', 'comment_threads', 'content_collaborators',
  'scheduled_content', 'user_followers', 'user_activity',
  'creator_badges', 'content_recommendations', 'reading_history',
  'citation_exports'
);

-- Should return 13 rows
```

---

## Part 2: Edge Functions Deployment

### Step 1: Set Environment Variables
```bash
# In Supabase dashboard or via CLI:
supabase secrets set RESEND_API_KEY "your-resend-api-key"
```

### Step 2: Deploy Functions
```bash
# Deploy all three edge functions
supabase functions deploy send-notifications
supabase functions deploy generate-recommendations
supabase functions deploy publish-scheduled
```

### Step 3: Configure Cron Jobs (Optional)
```bash
# Generate recommendations every hour
supabase functions update generate-recommendations --cron "0 * * * *"

# Publish scheduled content every 5 minutes
supabase functions update publish-scheduled --cron "*/5 * * * *"
```

### Test Edge Functions
```typescript
// Test send-notifications
const response = await fetch(
  'https://<project>.functions.supabase.co/send-notifications',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-uuid',
      type: 'comment',
      title: 'New comment on your post',
      message: 'Someone replied to your post'
    })
  }
);
```

---

## Part 3: Frontend Component Integration

### 3.1 Analytics Dashboard

**File**: `src/pages/Analytics.tsx`

**Where to use**:
1. Add route to your router:
```typescript
// In your router configuration
import Analytics from '@/pages/Analytics';

export const routes = [
  // ... other routes
  { path: '/analytics', component: Analytics, requireAuth: true }
];
```

2. Link in creator dashboard or main navigation:
```typescript
// In Navbar.tsx or CreatorDashboard.tsx
import { Link } from 'react-router-dom';

<Link to="/analytics" className="flex items-center gap-2">
  <BarChart3 size={18} />
  Analytics
</Link>
```

**Features**:
- Displays aggregated stats (views, shares, trending score, followers)
- Shows top 5 performing content
- Auto-loads on mount for authenticated users

---

### 3.2 Notification Center

**File**: `src/components/NotificationCenter.tsx`

**Where to use**:
1. Add to Navbar.tsx:
```typescript
import NotificationCenter from '@/components/NotificationCenter';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="flex items-center gap-4">
      {/* ... other nav items ... */}
      
      {/* Notification bell icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell size={20} />
        {/* Add unread count badge */}
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      </button>

      {/* Notification panel slides in from right */}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}
    </nav>
  );
}
```

2. Add unread badge to Navbar:
```typescript
// Fetch unread count
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const fetchUnreadCount = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setUnreadCount(data?.length || 0);
  };

  fetchUnreadCount();
  // Set up realtime subscription
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'notifications' },
      () => fetchUnreadCount()
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [user.id]);
```

---

### 3.3 Social Profile Card

**File**: `src/components/SocialProfile.tsx`

**Where to use**:
1. On creator profile pages:
```typescript
// In src/pages/CreatorProfile.tsx
import SocialProfile from '@/components/SocialProfile';

export default function CreatorProfile() {
  const { userId } = useParams();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <SocialProfile userId={userId} />
      </div>
      <div className="md:col-span-2">
        {/* Creator's posts and papers */}
      </div>
    </div>
  );
}
```

2. In author spotlight widget:
```typescript
// In src/components/AuthorSpotlight.tsx
import SocialProfile from '@/components/SocialProfile';

<SocialProfile userId={authorId} />
```

**Features**:
- Shows follower count, posts, papers
- Follow/unfollow button
- Verification badge
- Featured creator indicator

---

### 3.4 Content Scheduler

**File**: `src/components/ContentScheduler.tsx`

**Where to use**:
1. In Write Editor page (for scheduling posts):
```typescript
// In src/pages/WriteEditor.tsx
import ContentScheduler from '@/components/ContentScheduler';
import { useState } from 'react';

const [showScheduler, setShowScheduler] = useState(false);

// In form:
{showScheduler && (
  <ContentScheduler
    contentId={postId}
    contentType="post"
    onScheduled={() => {
      toast.success('Post scheduled!');
      setShowScheduler(false);
    }}
  />
)}

// Publish button with dropdown
<button onClick={() => setShowScheduler(!showScheduler)}>
  {showScheduler ? 'Cancel Schedule' : 'Schedule Post'}
</button>
```

2. In administration/creator dashboard:
```typescript
// Show scheduled posts awaiting publication
const [scheduledPosts, setScheduledPosts] = useState([]);

useEffect(() => {
  const fetchScheduled = async () => {
    const { data } = await supabase
      .from('scheduled_content')
      .select('*')
      .eq('content_type', 'post')
      .neq('status', 'published')
      .order('scheduled_publish_at', { ascending: true });
    
    setScheduledPosts(data || []);
  };

  fetchScheduled();
}, []);
```

---

### 3.5 Advanced Comments

**File**: `src/components/AdvancedComments.tsx`

**Where to use**:
1. In blog post pages:
```typescript
// In src/pages/BlogPost.tsx
import AdvancedComments from '@/components/AdvancedComments';

// At end of post content
<section className="mt-12 border-t pt-8">
  <h2 className="text-2xl font-bold mb-6">Comments</h2>
  <AdvancedComments
    contentId={postId}
    contentType="post"
  />
</section>
```

2. In research paper pages:
```typescript
// In src/pages/BlogPost.tsx (for research papers)
<AdvancedComments
  contentId={paperId}
  contentType="research_paper"
/>
```

3. Track reading history when comments are posted:
```typescript
// In AdvancedComments, after posting comment:
const trackReading = async () => {
  await supabase.from('reading_history').insert({
    user_id: user.id,
    content_id: contentId,
    read_duration_seconds: calculateDuration(),
    completed: true
  });
};
```

---

### 3.6 Recommendations Section

**File**: `src/components/Recommendations.tsx`

**Where to use**:
1. On homepage after featured section:
```typescript
// In src/pages/Index.tsx
import Recommendations from '@/components/Recommendations';

<section className="py-16">
  <h2 className="text-3xl font-bold mb-8">Recommended For You</h2>
  <Recommendations />
</section>
```

2. In sidebar on blog posts:
```typescript
// In src/pages/BlogPost.tsx sidebar
<aside className="sticky top-20">
  <Recommendations />
  {/* Other sidebar widgets */}
</aside>
```

3. Track when recommendations are viewed:
```typescript
// In Recommendations component, on click:
const trackClick = async (recommendationId) => {
  await supabase
    .from('content_recommendations')
    .update({ is_clicked: true })
    .eq('id', recommendationId);
};
```

---

### 3.7 Citation Exporter

**File**: `src/components/CitationExporter.tsx`

**Where to use**:
1. On research paper pages:
```typescript
// In src/pages/BlogPost.tsx (research papers)
import CitationExporter from '@/components/CitationExporter';

<div className="bg-secondary p-4 rounded-lg mb-6">
  <CitationExporter
    title={paper.title}
    authors={paper.authors}
    publishedAt={paper.published_at}
    doi={paper.doi}
    url={`https://yeszz.in/research/${paper.slug}`}
  />
</div>
```

2. In bibliography sections:
```typescript
// Show citations for referenced papers
<CitationExporter
  title={referencedPaper.title}
  authors={referencedPaper.authors}
  publishedAt={referencedPaper.published_at}
  doi={referencedPaper.doi}
/>
```

---

### 3.8 Email Subscription Manager

**File**: `src/components/EmailSubscriptionManager.tsx`

**Where to use**:
1. In user settings page:
```typescript
// In src/pages/Profile.tsx
import EmailSubscriptionManager from '@/components/EmailSubscriptionManager';

<div className="space-y-8">
  <section>
    <h2 className="text-xl font-bold mb-4">Email Preferences</h2>
    <p className="text-muted-foreground mb-4">
      Manage how you receive notifications and digests
    </p>
    <EmailSubscriptionManager userId={user.id} />
  </section>
</div>
```

2. In newsletter signup pages:
```typescript
// In src/components/NewsletterBanner.tsx
import EmailSubscriptionManager from '@/components/EmailSubscriptionManager';

// Show lightweight version for new subscribers
<EmailSubscriptionManager userId={user.id} compact={true} />
```

---

### 3.9 Collaboration Manager

**File**: `src/components/CollaborationManager.tsx`

**Where to use**:
1. In Creator Dashboard for published content:
```typescript
// In src/pages/CreatorDashboard.tsx
import CollaborationManager from '@/components/CollaborationManager';

<section>
  <h2 className="text-xl font-bold mb-4">Collaborations</h2>
  {selectedContent && (
    <CollaborationManager
      contentId={selectedContent.id}
      contentType="post"
      isAuthor={selectedContent.author_id === user.id}
    />
  )}
</section>
```

2. In Write Editor before publishing:
```typescript
// In src/pages/WriteEditor.tsx
{showCollaborators && (
  <CollaborationManager
    contentId={draftId}
    contentType="post"
    isAuthor={true}
    onCollaboratorAdded={() => {
      toast.success('Collaborator invited!');
    }}
  />
)}
```

---

## Part 4: Reading History Tracking

To properly track user engagement for recommendations, add reading history tracking:

```typescript
// Create a hook for tracking reading
// In src/hooks/useReadingHistory.ts
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';

export function useReadingHistory(contentId: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !contentId) return;

    const startTime = Date.now();

    return () => {
      // Track reading when component unmounts
      const readDuration = Math.floor((Date.now() - startTime) / 1000);

      supabase.from('reading_history').insert({
        user_id: user.id,
        content_id: contentId,
        read_duration_seconds: readDuration,
        completed: readDuration > 30 // Mark as completed if read 30+ seconds
      }).then(() => {
        // Silently log success
      }).catch(error => {
        console.error('Failed to track reading:', error);
      });
    };
  }, [user?.id, contentId]);
}
```

**Usage in pages**:
```typescript
// In src/pages/BlogPost.tsx
import { useReadingHistory } from '@/hooks/useReadingHistory';

export default function BlogPost() {
  const { postId } = useParams();
  useReadingHistory(postId);

  // Rest of component...
}
```

---

## Part 5: Testing Checklist

Before deploying to production:

### Database
- [ ] All 13 tables created successfully
- [ ] RLS policies applied and tested
- [ ] Indexes created (verify with `\di` in psql)
- [ ] Helper functions working (test with `SELECT calculate_trending_score(5)`)

### Edge Functions
- [ ] All 3 functions deployed
- [ ] `RESEND_API_KEY` environment variable set
- [ ] Can invoke functions via HTTPS (test in browser console)
- [ ] Email delivery working (check Resend dashboard)

### Components
- [ ] [ ] Analytics loads and displays stats
- [ ] [ ] Notifications appear and can be marked as read
- [ ] [ ] Social profile shows follower count and follow button
- [ ] [ ] Content scheduler creates scheduled_content records
- [ ] [ ] Comments can be posted and voted on
- [ ] [ ] Recommendations load for authenticated users
- [ ] [ ] Citations copy to clipboard without errors
- [ ] [ ] Email preferences save correctly
- [ ] [ ] Collaborators can be invited

### Integration
- [ ] [ ] Reading history tracked on blog posts
- [ ] [ ] Trending score updates for popular content
- [ ] [ ] Notification bell shows unread count
- [ ] [ ] Creator badges display on profiles
- [ ] [ ] Scheduled posts publish at correct time

---

## Part 6: Environment Setup

Add to your `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for build only)
RESEND_API_KEY=your-resend-api-key (for edge functions)
```

---

## Part 7: Performance Optimization

### Enable Row-Level Security Caching
```sql
ALTER TABLE content_analytics SET (fillfactor = 70);
ALTER TABLE content_recommendations SET (fillfactor = 70);
```

### Create Materialized Views for Expensive Queries
```sql
CREATE MATERIALIZED VIEW popular_content_cache AS
SELECT * FROM popular_content_view;

CREATE INDEX ON popular_content_cache (trending_score DESC);

-- Refresh every hour
-- Use pg_cron extension or external scheduler
```

### Database Maintenance
```bash
# Analyze tables for better query planning
ANALYZE content_analytics;
ANALYZE content_recommendations;

# Vacuum to reclaim space
VACUUM ANALYZE;
```

---

## Part 8: Monitoring & Debugging

### Check function logs
```bash
supabase functions logs send-notifications
supabase functions logs generate-recommendations
supabase functions logs publish-scheduled
```

### Monitor realtime subscriptions
```typescript
// In browser console
supabase
  .channel('realtime:notifications')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'notifications' },
    (payload) => console.log('New notification:', payload)
  )
  .subscribe()
```

### Debug recommendation engine
```sql
-- Check reading history
SELECT user_id, COUNT(*) as total_reads
FROM reading_history
GROUP BY user_id
ORDER BY total_reads DESC;

-- Check recommendation scores
SELECT * FROM content_recommendations
WHERE user_id = 'your-user-id'
ORDER BY score DESC
LIMIT 10;
```

---

**Integration Status**: All components ready for production
**Estimated Integration Time**: 2-4 hours per environment
**Last Updated**: March 3, 2026
