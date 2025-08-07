-- Migration: Speed Optimization Tables (Fixed Version)
-- Description: Adds embedding, cache, and quick stats tables for lightning-fast matching

-- Designer Embeddings Table for instant similarity matching
CREATE TABLE IF NOT EXISTS designer_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  embedding FLOAT[] NOT NULL, -- 512-dimensional vector
  metadata_hash TEXT NOT NULL, -- To track when to regenerate
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(designer_id)
);

-- Match Cache Table for ultra-fast repeated queries
CREATE TABLE IF NOT EXISTS match_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL, -- Hash of brief + designer
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  brief_hash TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  ai_analysis JSONB, -- Store full AI analysis
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cache_key)
);

-- Designer Quick Stats Materialized View for instant access (Fixed for current schema)
CREATE MATERIALIZED VIEW IF NOT EXISTS designer_quick_stats AS
SELECT 
  d.id as designer_id,
  COUNT(DISTINCT m.id) as total_projects,
  COALESCE(d.rating, 4.5) as avg_rating,
  0.95 as completion_rate, -- Default value since column doesn't exist yet
  24 as avg_response_time_hours, -- Default value
  ARRAY_AGG(DISTINCT ind) FILTER (WHERE ind IS NOT NULL) as top_industries,
  ARRAY_AGG(DISTINCT style) FILTER (WHERE style IS NOT NULL) as top_styles,
  NOW() as last_updated
FROM designers d
LEFT JOIN matches m ON d.id = m.designer_id AND m.status IN ('completed', 'accepted')
LEFT JOIN LATERAL unnest(d.industries) ind ON true
LEFT JOIN LATERAL unnest(d.styles) style ON true
WHERE d.is_approved = true AND d.is_verified = true
GROUP BY d.id, d.rating;

-- Create indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_designer_availability ON designers(availability, is_verified, is_approved);
CREATE INDEX IF NOT EXISTS idx_designer_styles ON designers USING GIN(styles);
CREATE INDEX IF NOT EXISTS idx_designer_industries ON designers USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_cache_lookup ON match_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_brief ON match_cache(brief_hash);
CREATE INDEX IF NOT EXISTS idx_embedding_designer ON designer_embeddings(designer_id);

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_quick_stats_designer ON designer_quick_stats(designer_id);

-- Function to refresh quick stats
CREATE OR REPLACE FUNCTION refresh_designer_quick_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY designer_quick_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM match_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON designer_embeddings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_cache TO authenticated;
GRANT SELECT ON designer_quick_stats TO authenticated;
GRANT SELECT ON designer_quick_stats TO anon;

-- Create trigger to update embedding when designer profile changes
CREATE OR REPLACE FUNCTION mark_embedding_for_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark embedding as needing update by changing metadata_hash
  UPDATE designer_embeddings 
  SET metadata_hash = 'needs_update_' || extract(epoch from now())::text
  WHERE designer_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_designer_embedding_trigger
AFTER UPDATE OF styles, industries
ON designers
FOR EACH ROW
EXECUTE FUNCTION mark_embedding_for_update();