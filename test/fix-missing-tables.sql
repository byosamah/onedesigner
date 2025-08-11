-- Fix Missing Tables for OneDesigner
-- Run this migration to fix current database issues

-- 1. Client Designers Table (tracks which designers a client has unlocked)
CREATE TABLE IF NOT EXISTS client_designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, designer_id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_designers_client ON client_designers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_designers_designer ON client_designers(designer_id);

-- 2. OTP Codes Table (for centralized OTP service)
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('client', 'designer', 'admin')),
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'signup', 'reset', 'verify')),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

-- Add indexes for OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_email_code ON otp_codes(email, code) WHERE verified = FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at) WHERE verified = FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_codes(email, purpose) WHERE verified = FALSE;

-- 3. Email Queue Table (for reliable email delivery)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) DEFAULT 'hello@onedesigner.app',
  template VARCHAR(100),
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'bounced')),
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error TEXT,
  metadata JSONB,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Add indexes for email queue processing
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC, created_at ASC) WHERE status = 'pending';

-- 4. Audit Log Table (for tracking important actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id VARCHAR(36),
  user_id UUID,
  user_type VARCHAR(20),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 5. Fix match_unlocks table to allow null payment_id (for credit-based unlocks)
ALTER TABLE match_unlocks 
ALTER COLUMN payment_id DROP NOT NULL;

-- 6. Add missing columns to matches table if they don't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS has_conversation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMPTZ;

-- 7. Create rate_limit table for tracking API rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- email, user_id, or IP
  action VARCHAR(100) NOT NULL, -- 'otp_generate', 'email_send', etc.
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);

-- Add index for rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, action, window_end) WHERE window_end > NOW();

-- 8. Migrate existing OTP data if auth_tokens table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_tokens') THEN
    INSERT INTO otp_codes (email, code, type, purpose, expires_at, verified, created_at, verified_at)
    SELECT 
      email,
      token as code,
      CASE 
        WHEN email IN (SELECT email FROM designers) THEN 'designer'
        WHEN email IN (SELECT email FROM clients) THEN 'client'
        ELSE 'client'
      END as type,
      'login' as purpose,
      expires_at,
      used as verified,
      created_at,
      CASE WHEN used THEN updated_at ELSE NULL END as verified_at
    FROM auth_tokens
    WHERE LENGTH(token) = 6 -- Only migrate OTP codes, not other tokens
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 9. Create function to clean up expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < NOW() - INTERVAL '1 day'
    AND verified = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to clean up old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON client_designers TO authenticated;
GRANT ALL ON otp_codes TO authenticated;
GRANT ALL ON email_queue TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON rate_limits TO authenticated;

-- Add RLS policies if needed
ALTER TABLE client_designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created/updated:';
  RAISE NOTICE '  - client_designers';
  RAISE NOTICE '  - otp_codes';
  RAISE NOTICE '  - email_queue';
  RAISE NOTICE '  - audit_logs';
  RAISE NOTICE '  - rate_limits';
  RAISE NOTICE '  - match_unlocks (fixed payment_id)';
  RAISE NOTICE '  - matches (added conversation columns)';
END $$;