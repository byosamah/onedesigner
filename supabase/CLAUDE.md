# Database Architecture - CLAUDE.md

## Overview
OneDesigner uses Supabase (PostgreSQL) as its primary database with a comprehensive schema supporting AI matching, user management, project requests, and performance optimization. The database implements Row Level Security (RLS) and includes materialized views for performance.

## Database Configuration

### Supabase Setup
- **Project URL**: `https://frwchtwxpnrlpzksupgm.supabase.co`
- **Database**: PostgreSQL 15+ with extensions
- **Authentication**: Built-in Supabase Auth + Custom OTP system
- **Storage**: Supabase Storage for file uploads
- **Real-time**: WebSocket subscriptions for live updates

### Connection Management
```typescript
// Client-side (Browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

// Server-side (API Routes)  
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Edge Runtime Compatible
export const createEdgeClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Core Database Schema

### User Management Tables

#### `clients` Table
**Purpose**: Client user accounts and credit management
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  match_credits INTEGER DEFAULT 0, -- Credits for unlocking designers
  is_verified BOOLEAN DEFAULT false,
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_credits ON clients(match_credits);
CREATE INDEX idx_clients_verified ON clients(is_verified);
```

#### `designers` Table  
**Purpose**: Designer profiles with approval workflow
```sql
CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  professional_title VARCHAR(200),
  bio TEXT,
  location VARCHAR(200),
  avatar_url TEXT,
  
  -- Experience & Skills
  years_experience VARCHAR(50),
  categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- Design categories
  industries_worked TEXT[] DEFAULT ARRAY[]::TEXT[],
  design_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Portfolio & Work
  portfolio_url VARCHAR(500),
  portfolio_images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  case_studies JSONB DEFAULT '[]'::jsonb,
  
  -- Business Info
  rate_range VARCHAR(100),
  availability_status VARCHAR(50) DEFAULT 'available',
  working_hours VARCHAR(200),
  timezone VARCHAR(50),
  
  -- Approval Workflow
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false, -- Admin approval required
  edited_after_approval BOOLEAN DEFAULT false, -- Profile edit tracking
  last_approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  -- Additional Data
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_designers_email ON designers(email);
CREATE INDEX idx_designers_approved ON designers(is_approved);
CREATE INDEX idx_designers_verified ON designers(is_verified);
CREATE INDEX idx_designers_categories ON designers USING gin(categories);
CREATE INDEX idx_designers_industries ON designers USING gin(industries_worked);
CREATE INDEX idx_designers_styles ON designers USING gin(design_styles);
CREATE INDEX idx_designers_updated ON designers(updated_at);
```

### Project & Matching Tables

#### `briefs` Table
**Purpose**: Client project requirements and specifications
```sql
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Basic Project Info
  project_type VARCHAR(100) NOT NULL, -- Design category
  industry VARCHAR(100),
  budget VARCHAR(50), -- Budget range
  timeline VARCHAR(50), -- Timeline expectation
  
  -- Project Details
  project_title VARCHAR(200),
  project_description TEXT,
  requirements TEXT,
  target_audience TEXT,
  additional_notes TEXT,
  
  -- Preferences Arrays
  styles TEXT[] DEFAULT ARRAY[]::TEXT[], -- Style preferences
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[], -- Required deliverables
  reference_materials JSONB DEFAULT '[]'::jsonb, -- Reference links/images
  
  -- Category-Specific Fields (JSONB for flexibility)
  category_specific_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Status & Metadata
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_briefs_project_type ON briefs(project_type);
CREATE INDEX idx_briefs_industry ON briefs(industry);
CREATE INDEX idx_briefs_status ON briefs(status);
CREATE INDEX idx_briefs_created ON briefs(created_at);
CREATE INDEX idx_briefs_styles ON briefs USING gin(styles);
```

#### `matches` Table
**Purpose**: AI-generated designer-client matches
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
  
  -- AI Matching Results
  score INTEGER NOT NULL CHECK (score >= 50 AND score <= 85), -- Match score percentage
  reasons TEXT[] NOT NULL, -- 3 key reasons for match
  ai_message TEXT, -- Personalized recommendation message
  ai_analysis JSONB DEFAULT '{}'::jsonb, -- Detailed AI analysis
  
  -- Match Metadata
  match_version VARCHAR(20) DEFAULT 'v1', -- Matching algorithm version
  ai_provider VARCHAR(50) DEFAULT 'deepseek', -- AI provider used
  processing_time INTEGER, -- Response time in milliseconds
  tokens_used INTEGER, -- AI tokens consumed
  
  -- Status & Workflow
  status VARCHAR(50) DEFAULT 'active', -- active, unlocked, expired
  unlocked_at TIMESTAMP,
  expires_at TIMESTAMP, -- 7-day expiry
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Additional Context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure no duplicate matches per client-designer-brief
  UNIQUE(client_id, designer_id, brief_id)
);

-- Indexes  
CREATE INDEX idx_matches_client_id ON matches(client_id);
CREATE INDEX idx_matches_designer_id ON matches(designer_id);
CREATE INDEX idx_matches_brief_id ON matches(brief_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(score DESC); -- For ranking
CREATE INDEX idx_matches_created ON matches(created_at DESC);
CREATE INDEX idx_matches_expires ON matches(expires_at);
CREATE INDEX idx_matches_composite ON matches(client_id, status, score DESC);
```

#### `client_designers` Table
**Purpose**: Track unlocked designer relationships
```sql
CREATE TABLE client_designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  
  -- Unlock Details
  unlocked_via VARCHAR(50) DEFAULT 'credit', -- credit, package, admin
  credits_used INTEGER DEFAULT 1,
  unlock_reason TEXT,
  
  -- Timestamps
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure unique client-designer pairs
  UNIQUE(client_id, designer_id)
);

-- Indexes
CREATE INDEX idx_client_designers_client ON client_designers(client_id);
CREATE INDEX idx_client_designers_designer ON client_designers(designer_id);
CREATE INDEX idx_client_designers_unlocked ON client_designers(unlocked_at DESC);
```

### Communication & Request Tables

#### `project_requests` Table  
**Purpose**: Working request system for client-designer communication
```sql
CREATE TABLE project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  
  -- Request Details
  message TEXT NOT NULL, -- Client's project message
  client_email VARCHAR(255), -- Client contact for approved requests
  
  -- Brief Snapshot (JSONB copy of brief at time of request)
  brief_snapshot JSONB NOT NULL, -- Complete project details preserved
  
  -- Status & Workflow
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  response_deadline TIMESTAMP NOT NULL, -- 72-hour deadline
  
  -- Designer Interaction
  viewed_at TIMESTAMP, -- When designer first viewed request
  responded_at TIMESTAMP, -- When designer responded
  response_message TEXT, -- Designer's response (if any)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_project_requests_match ON project_requests(match_id);
CREATE INDEX idx_project_requests_client ON project_requests(client_id);
CREATE INDEX idx_project_requests_designer ON project_requests(designer_id);
CREATE INDEX idx_project_requests_status ON project_requests(status);
CREATE INDEX idx_project_requests_deadline ON project_requests(response_deadline);
CREATE INDEX idx_project_requests_created ON project_requests(created_at DESC);
```

### Authentication & Security Tables

#### `auth_tokens` Table (OTP System)
**Purpose**: Secure OTP storage and validation
```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL, -- 6-digit OTP code
  type VARCHAR(20) NOT NULL, -- client, designer, admin
  purpose VARCHAR(20) NOT NULL, -- login, signup, reset, verify
  
  -- Security & Expiry
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  -- Rate Limiting
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_auth_tokens_email ON auth_tokens(email);
CREATE INDEX idx_auth_tokens_code ON auth_tokens(code);
CREATE INDEX idx_auth_tokens_type_purpose ON auth_tokens(type, purpose);
CREATE INDEX idx_auth_tokens_expires ON auth_tokens(expires_at);
CREATE INDEX idx_auth_tokens_verified ON auth_tokens(verified);

-- Cleanup expired tokens
CREATE INDEX idx_auth_tokens_cleanup ON auth_tokens(created_at) WHERE verified = false;
```

### Performance & Caching Tables

#### `designer_embeddings` Table
**Purpose**: Pre-computed vector embeddings for instant matching
```sql
CREATE TABLE designer_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE UNIQUE,
  
  -- Vector Embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding FLOAT8[] NOT NULL, -- Vector representation
  
  -- Generation Info
  model_version VARCHAR(50) DEFAULT 'text-embedding-3-small',
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Status
  needs_update BOOLEAN DEFAULT false, -- Flag for regeneration
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_embeddings_designer ON designer_embeddings(designer_id);
CREATE INDEX idx_embeddings_updated ON designer_embeddings(updated_at);
CREATE INDEX idx_embeddings_needs_update ON designer_embeddings(needs_update);
```

#### `match_cache` Table
**Purpose**: Cache AI matching results to prevent re-computation
```sql
CREATE TABLE match_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES briefs(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  
  -- Cached Match Results
  score INTEGER NOT NULL,
  reasons TEXT[] NOT NULL,
  message TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Cache Management
  expires_at TIMESTAMP NOT NULL, -- 24-hour cache TTL
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Performance Tracking
  generation_time INTEGER, -- Original generation time in ms
  cache_hits INTEGER DEFAULT 0,
  
  -- Ensure unique cache entries
  UNIQUE(brief_id, designer_id)
);

-- Indexes
CREATE INDEX idx_match_cache_brief ON match_cache(brief_id);
CREATE INDEX idx_match_cache_designer ON match_cache(designer_id);
CREATE INDEX idx_match_cache_expires ON match_cache(expires_at);
CREATE INDEX idx_match_cache_score ON match_cache(score DESC);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM match_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Materialized Views for Performance

#### `designer_quick_stats` View
**Purpose**: Pre-computed designer statistics for dashboard queries
```sql
CREATE MATERIALIZED VIEW designer_quick_stats AS
SELECT 
  d.id as designer_id,
  d.first_name,
  d.last_name,
  d.professional_title,
  d.avatar_url,
  d.is_approved,
  d.is_verified,
  d.categories,
  d.design_styles,
  d.availability_status,
  d.created_at,
  d.updated_at,
  d.edited_after_approval,
  
  -- Computed Stats
  COALESCE(match_stats.total_matches, 0) as total_matches,
  COALESCE(match_stats.avg_score, 0) as avg_match_score,
  COALESCE(request_stats.pending_requests, 0) as pending_requests,
  COALESCE(request_stats.accepted_requests, 0) as accepted_requests,
  
  -- Ranking Factors
  CASE 
    WHEN d.is_approved AND d.is_verified THEN 100
    WHEN d.is_approved THEN 80
    WHEN d.is_verified THEN 60
    ELSE 40
  END as priority_score
  
FROM designers d

LEFT JOIN (
  SELECT 
    designer_id,
    COUNT(*) as total_matches,
    AVG(score) as avg_score
  FROM matches 
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY designer_id
) match_stats ON d.id = match_stats.designer_id

LEFT JOIN (
  SELECT 
    designer_id,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_requests
  FROM project_requests
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY designer_id
) request_stats ON d.id = request_stats.designer_id;

-- Indexes on materialized view
CREATE INDEX idx_quick_stats_approved ON designer_quick_stats(is_approved, priority_score DESC);
CREATE INDEX idx_quick_stats_categories ON designer_quick_stats USING gin(categories);
CREATE INDEX idx_quick_stats_matches ON designer_quick_stats(total_matches DESC);

-- Refresh materialized view hourly
CREATE OR REPLACE FUNCTION refresh_designer_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW designer_quick_stats;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS)

### Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;

-- Client access policies
CREATE POLICY "Clients can view their own data" ON clients
  FOR ALL USING (auth.uid() = id::text);

CREATE POLICY "Clients can view approved designers" ON designers
  FOR SELECT USING (is_approved = true);

-- Designer access policies
CREATE POLICY "Designers can view their own data" ON designers
  FOR ALL USING (auth.uid() = id::text);

-- Match access policies  
CREATE POLICY "Clients can view their matches" ON matches
  FOR SELECT USING (client_id IN (
    SELECT id FROM clients WHERE auth.uid() = id::text
  ));

-- Admin access policies (service role bypass)
-- Admins use service role key which bypasses RLS
```

## Database Functions & Triggers

### Automatic Timestamp Updates
```sql
-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designers_updated_at 
  BEFORE UPDATE ON designers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at 
  BEFORE UPDATE ON briefs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Designer Profile Edit Tracking
```sql
-- Track when designers edit their profiles after approval
CREATE OR REPLACE FUNCTION track_designer_edits()
RETURNS TRIGGER AS $$
BEGIN
  -- If designer is approved and profile fields changed, mark as edited
  IF OLD.is_approved = true AND (
    OLD.first_name != NEW.first_name OR
    OLD.last_name != NEW.last_name OR
    OLD.professional_title != NEW.professional_title OR
    OLD.bio != NEW.bio OR
    OLD.categories != NEW.categories OR
    OLD.portfolio_url != NEW.portfolio_url
  ) THEN
    NEW.edited_after_approval = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_designer_profile_edits
  BEFORE UPDATE ON designers
  FOR EACH ROW EXECUTE FUNCTION track_designer_edits();
```

### Automatic Cleanup Functions
```sql
-- Clean up expired auth tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_tokens 
  WHERE expires_at < NOW() 
  AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired matches
CREATE OR REPLACE FUNCTION cleanup_expired_matches()
RETURNS void AS $$
BEGIN
  UPDATE matches 
  SET status = 'expired' 
  WHERE expires_at < NOW() 
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

## Data Migration History

### Migration Files (`/supabase/migrations/`)
1. **`001_initial_schema.sql`** - Core tables (clients, designers, briefs)
2. **`002_rls_policies.sql`** - Row Level Security setup
3. **`003_payments_and_credits.sql`** - Credit system tables
4. **`004_designer_attributes.sql`** - Extended designer profile fields
5. **`005_designer_approval.sql`** - Approval workflow columns
6. **`006_enhanced_designer_profiles.sql`** - Portfolio and experience fields
7. **`007_speed_optimization_tables_fixed.sql`** - Performance tables (embeddings, cache)
8. **`008_add_enhanced_brief_fields.sql`** - Extended brief fields
9. **`009_add_working_preference_fields.sql`** - Designer availability fields
10. **`010_add_designer_enhanced_fields.sql`** - Additional designer metadata
11. **`011_add_portfolio_image_columns.sql`** - Portfolio image support
12. **`012_add_designer_rejection_tracking.sql`** - Rejection reason tracking
13. **`013_add_missing_array_columns.sql`** - Array field additions
14. **`014_blog_system.sql`** - Blog system tables (if applicable)
15. **`20250816_create_notification_tables.sql`** - Notification system
16. **`20250818_enhance_project_requests.sql`** - Working request system

### Migration Strategy
- **Forward-only**: All migrations are additive, no data loss
- **Rollback Support**: Each migration includes rollback SQL
- **Testing**: All migrations tested on staging before production
- **Backup**: Automatic backups before major schema changes

## Database Performance Optimization

### Query Optimization
- **Composite Indexes**: Multi-column indexes for complex queries
- **Partial Indexes**: Filtered indexes for common query patterns  
- **GIN Indexes**: Array field searching (categories, skills, styles)
- **Materialized Views**: Pre-computed aggregations for dashboards

### Connection Management
- **Connection Pooling**: Supabase handles connection pooling automatically
- **Query Timeout**: 30-second timeout for long-running queries
- **Connection Limits**: Service role limited to 60 concurrent connections
- **Read Replicas**: Future consideration for read-heavy workloads

### Caching Strategy
- **Application Level**: DataService with 5-minute TTL
- **Database Level**: Match result caching in match_cache table
- **CDN Level**: Static assets and public data via Vercel
- **Browser Level**: Session data and user preferences

## Backup & Recovery

### Automated Backups
- **Point-in-Time Recovery**: 7-day retention via Supabase
- **Daily Snapshots**: Automatic daily database snapshots
- **Cross-Region**: Backups stored in multiple geographic regions
- **Encryption**: All backups encrypted at rest and in transit

### Disaster Recovery
- **RTO**: Recovery Time Objective of 1 hour
- **RPO**: Recovery Point Objective of 15 minutes
- **Failover**: Automatic failover to backup region
- **Testing**: Monthly disaster recovery testing procedures

This database architecture provides OneDesigner with a robust, scalable foundation that supports complex AI matching, user management, and performance optimization while maintaining data integrity and security.